import { NextRequest, NextResponse } from "next/server";
import { getCandidateProfiles } from "@/lib/profilesData";
import { applyObjectiveFilters, rankCandidatesForScoring } from "@/lib/filterEngine";
import { callLLMJSON } from "@/lib/llm/client";
import {
  REFINE_CRITERIA_SYSTEM_PROMPT,
  buildRefineCriteriaUserPrompt,
} from "@/lib/prompts/refineCriteria";
import {
  SCORE_CANDIDATES_SYSTEM_PROMPT,
  buildScoreCandidatesUserPrompt,
} from "@/lib/prompts/scoreCandidates";
import { ChangelogItem, FitRubric, ObjectiveFilters, ScoredCandidate } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentFilters, currentRubric, candidates, recruiterFeedback, forceError } = body;

    if (!recruiterFeedback || typeof recruiterFeedback !== "string") {
      return NextResponse.json(
        { error: "Recruiter feedback is required to refine the search." },
        { status: 400 }
      );
    }

    // Step 1: Call LLM to interpret recruiter feedback and adjust filters/rubric
    const refinementResult = await callLLMJSON<{
      changelog: ChangelogItem[];
      updated_objective_filters: ObjectiveFilters;
      updated_fit_rubric: FitRubric;
    }>({
      systemPrompt: REFINE_CRITERIA_SYSTEM_PROMPT,
      userPrompt: buildRefineCriteriaUserPrompt(
        currentFilters,
        currentRubric,
        candidates || [],
        recruiterFeedback
      ),
      forceErrorSimulation: forceError,
    });

    const updatedFilters = refinementResult.updated_objective_filters;
    const updatedRubric = refinementResult.updated_fit_rubric;
    const changelog = refinementResult.changelog || [];

    // Step 2: Re-run local deterministic filter against all 48 profiles with updated filters
    const allProfiles = getCandidateProfiles();
    const passedProfiles = applyObjectiveFilters(allProfiles, updatedFilters);

    if (passedProfiles.length === 0) {
      return NextResponse.json({
        changelog,
        updated_objective_filters: updatedFilters,
        updated_fit_rubric: updatedRubric,
        candidates: [],
        totalPoolCount: allProfiles.length,
        passedFilterCount: 0,
        message: "After this refinement, no candidates matched the hard filters. Consider loosening constraints.",
      });
    }

    // Step 3: Prioritize top candidates for LLM scoring
    const prioritizedForScoring = rankCandidatesForScoring(passedProfiles, updatedFilters).slice(0, 8);

    // Score against updated rubric
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
      userPrompt: buildScoreCandidatesUserPrompt(prioritizedForScoring, updatedRubric, updatedFilters),
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
            reason: "Skills aligned with refined criteria.",
          },
        ],
        red_flags_or_tradeoffs: evalData?.red_flags_or_tradeoffs,
        user_feedback: "neutral",
      };
    });

    scoredCandidates.sort((a, b) => b.fit_score - a.fit_score);
    const topCandidates = scoredCandidates.slice(0, 5);

    return NextResponse.json({
      changelog,
      updated_objective_filters: updatedFilters,
      updated_fit_rubric: updatedRubric,
      candidates: topCandidates,
      totalPoolCount: allProfiles.length,
      passedFilterCount: passedProfiles.length,
    });
  } catch (error: any) {
    console.error("Refine API error:", error);
    const isRateLimit = error.message?.includes("429") || error.message?.includes("Rate limit");
    const isTimeout = error.message?.includes("timed out") || error.message?.includes("Timeout");
    const isMalformed = error.message?.includes("Malformed JSON");

    let errorType = "server_error";
    if (isRateLimit) errorType = "rate_limit";
    else if (isTimeout) errorType = "timeout";
    else if (isMalformed) errorType = "malformed_output";

    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during search refinement.",
        type: errorType,
        retryable: true,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
