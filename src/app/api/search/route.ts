import { NextRequest, NextResponse } from "next/server";
import { getCandidateProfiles } from "@/lib/profilesData";
import { applyObjectiveFilters, rankCandidatesForScoring } from "@/lib/filterEngine";
import { callLLMJSON } from "@/lib/llm/client";
import {
  EXTRACT_CRITERIA_SYSTEM_PROMPT,
  buildExtractCriteriaUserPrompt,
} from "@/lib/prompts/extractCriteria";
import {
  SCORE_CANDIDATES_SYSTEM_PROMPT,
  buildScoreCandidatesUserPrompt,
} from "@/lib/prompts/scoreCandidates";
import { FitRubric, ObjectiveFilters, ScoredCandidate } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, manualFilters, manualRubric, forceError } = body;

    if (!query && !manualFilters) {
      return NextResponse.json(
        { error: "Please provide a search requirement query." },
        { status: 400 }
      );
    }

    // Step 1: Free text to objective filters and rubric (or use manual edits if provided)
    let filters: ObjectiveFilters;
    let rubric: FitRubric;

    if (manualFilters && manualRubric) {
      filters = manualFilters;
      rubric = manualRubric;
    } else {
      const extracted = await callLLMJSON<{
        objective_filters: ObjectiveFilters;
        fit_rubric: FitRubric;
      }>({
        systemPrompt: EXTRACT_CRITERIA_SYSTEM_PROMPT,
        userPrompt: buildExtractCriteriaUserPrompt(query),
        forceErrorSimulation: forceError,
      });

      filters = extracted.objective_filters;
      rubric = extracted.fit_rubric;
    }

    // Step 2: Deterministic local filter against 48 profiles
    const allProfiles = getCandidateProfiles();
    const passedProfiles = applyObjectiveFilters(allProfiles, filters);

    if (passedProfiles.length === 0) {
      return NextResponse.json({
        filters,
        rubric,
        candidates: [],
        totalPoolCount: allProfiles.length,
        passedFilterCount: 0,
        message: "No profiles matched all hard filters. Try relaxing experience or skills in the filter bar.",
      });
    }

    // Step 3: Select top candidate pool for LLM scoring (up to 8 candidates to be fast and cost-effective)
    const prioritizedForScoring = rankCandidatesForScoring(passedProfiles, filters).slice(0, 8);

    // Call LLM to score candidates and cite exact profile fields
    const scoreResult = await callLLMJSON<{
      evaluations: {
        candidate_id: string;
        fit_score: number;
        match_status: "strong_match" | "potential_match" | "weak_match";
        cited_reasons: {
          field: "skills" | "experience" | "company_background" | "summary" | "education";
          quote_or_value: string;
          reason: string;
        }[];
        red_flags_or_tradeoffs?: string[];
      }[];
    }>({
      systemPrompt: SCORE_CANDIDATES_SYSTEM_PROMPT,
      userPrompt: buildScoreCandidatesUserPrompt(prioritizedForScoring, rubric, filters),
      forceErrorSimulation: forceError,
    });

    const evaluationsMap = new Map(
      (scoreResult.evaluations || []).map((e) => [e.candidate_id, e])
    );

    const scoredCandidates: ScoredCandidate[] = prioritizedForScoring.map((profile) => {
      const evalData = evaluationsMap.get(profile.id);
      return {
        candidate: profile,
        fit_score: evalData?.fit_score ?? 70,
        match_status: evalData?.match_status ?? "potential_match",
        cited_reasons: evalData?.cited_reasons ?? [
          {
            field: "skills",
            quote_or_value: profile.skills.slice(0, 3).join(", "),
            reason: `Matches required tech stack with ${profile.years_experience} years of experience.`,
          },
        ],
        red_flags_or_tradeoffs: evalData?.red_flags_or_tradeoffs,
        user_feedback: "neutral",
      };
    });

    // Sort descending by fit score and take top 4-5 as specified
    scoredCandidates.sort((a, b) => b.fit_score - a.fit_score);
    const topCandidates = scoredCandidates.slice(0, 5);

    return NextResponse.json({
      filters,
      rubric,
      candidates: topCandidates,
      totalPoolCount: allProfiles.length,
      passedFilterCount: passedProfiles.length,
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    const isRateLimit = error.message?.includes("429") || error.message?.includes("Rate limit");
    const isTimeout = error.message?.includes("timed out") || error.message?.includes("Timeout");
    const isMalformed = error.message?.includes("Malformed JSON");

    let errorType = "server_error";
    if (isRateLimit) errorType = "rate_limit";
    else if (isTimeout) errorType = "timeout";
    else if (isMalformed) errorType = "malformed_output";

    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during search.",
        type: errorType,
        retryable: true,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
