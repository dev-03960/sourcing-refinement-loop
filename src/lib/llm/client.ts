import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  forceErrorSimulation?: "rate_limit" | "malformed_output" | "timeout";
}

/**
 * Extracts and parses JSON from raw LLM output, resilient to markdown backticks
 * and accidental prefix/suffix chatter.
 */
export function cleanAndParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines.length > 0 && lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    cleaned = lines.join("\n").trim();
  }

  // Find outermost JSON object or array
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    throw new Error(`Malformed JSON from LLM: ${err.message}. Raw: ${cleaned.slice(0, 150)}...`);
  }
}

/**
 * Resilient LLM Caller supporting Groq and Gemini with timeouts, retries,
 * and error simulation for the Loom submission walkthrough.
 */
export async function callLLMJSON<T>(options: LLMRequestOptions, retries = 1): Promise<T> {
  const { systemPrompt, userPrompt, temperature = 0.2, forceErrorSimulation } = options;

  // Handle intentional failure simulations for assignment demo
  if (forceErrorSimulation === "rate_limit") {
    throw new Error("429 Too Many Requests: Rate limit exceeded for model. (Simulated for Loom Walkthrough)");
  }
  if (forceErrorSimulation === "malformed_output") {
    throw new Error("Malformed JSON response: Unexpected token < in JSON at position 0 (Simulated for Loom Walkthrough)");
  }
  if (forceErrorSimulation === "timeout") {
    throw new Error("Request Timeout: LLM inference exceeded 12000ms threshold (Simulated for Loom Walkthrough)");
  }

  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (!groqApiKey && !geminiApiKey) {
    throw new Error(
      "No LLM API key detected. Please set GROQ_API_KEY or GEMINI_API_KEY in your .env.local file."
    );
  }

  let attempt = 0;
  while (attempt <= retries) {
    try {
      // 1. Prefer Groq if key is available
      if (groqApiKey) {
        const groq = new Groq({ apiKey: groqApiKey });
        // Use openai/gpt-oss-120b or qwen/qwen3.8-27b which are enabled on this account
        const modelName = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
        const completion = await Promise.race([
          groq.chat.completions.create({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature,
            response_format: { type: "json_object" },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("LLM request timed out after 15s")), 15000)
          ),
        ]);

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response received from Groq LLM");
        }
        return cleanAndParseJSON<T>(content);
      }

      // 2. Fallback to Google Gemini
      if (geminiApiKey) {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: systemPrompt,
          generationConfig: {
            responseMimeType: "application/json",
            temperature,
          },
        });

        const result = await Promise.race([
          model.generateContent(userPrompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini request timed out after 15s")), 15000)
          ),
        ]);

        const text = result.response.text();
        if (!text) {
          throw new Error("Empty response received from Gemini LLM");
        }
        return cleanAndParseJSON<T>(text);
      }
    } catch (error: any) {
      attempt++;
      if (attempt > retries) {
        // Enhance error message for UI consumption
        const isRateLimit = error.message?.includes("429") || error.status === 429;
        const isTimeout = error.message?.includes("timed out");
        const customMsg = isRateLimit
          ? "Rate limit reached on LLM provider. Please wait a few seconds."
          : isTimeout
          ? "LLM query timed out. Retrying recommended."
          : error.message || "Failed to process LLM request";
        throw new Error(customMsg);
      }
      // Wait 1s before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("LLM request failed after retries.");
}
