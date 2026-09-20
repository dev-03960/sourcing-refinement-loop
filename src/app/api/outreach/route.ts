import { NextRequest, NextResponse } from "next/server";
import { callLLMJSON } from "@/lib/llm/client";
import { CandidateProfile, FitRubric } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { candidate, rubric, roleTitle }: { candidate: CandidateProfile; rubric: FitRubric; roleTitle?: string } =
      await req.json();

    if (!candidate) {
      return NextResponse.json({ error: "Candidate data required" }, { status: 400 });
    }

    const systemPrompt = `You are an elite technical recruiter known for crafting thoughtful, high-response outreach messages to senior engineers.
Rules:
- Subject line must be punchy and non-spammy.
- Body should cite specific details from their background (their company, years of experience, and specific tech stack like AWS RDS or PostgreSQL).
- Keep it under 150 words.
- Professional, respectful, and appealing to startup-minded builders.
- Output raw JSON conforming to schema.

SCHEMA:
{
  "subject": string,
  "body": string,
  "call_to_action": string
}`;

    const userPrompt = `Generate a personalized recruiter email for:
Name: ${candidate.name}
Title: ${candidate.current_title} at ${candidate.current_company} (${candidate.current_company_type})
Experience: ${candidate.years_experience} years
Key Skills: ${candidate.skills.join(", ")}
Summary: "${candidate.summary}"
Target Role: ${roleTitle || "Senior Backend / Cloud Database Engineer"}
What good looks like: ${rubric?.ideal_profile_summary || "Fast scaling startup ownership"}`;

    const pitch = await callLLMJSON<{
      subject: string;
      body: string;
      call_to_action: string;
    }>({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
    });

    return NextResponse.json({ pitch });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to draft outreach" }, { status: 500 });
  }
}
