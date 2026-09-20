import { FitRubric, ObjectiveFilters, ScoredCandidate } from "@/types";

/**
 * Evaluator Requirement:
 * "The recruiter reacts in chat - '1 is too junior, 2 and 4 are right' - or with per-profile yes/no.
 * The app says what it changed in the filters or rubric and why, re-runs the search, and shows the new set."
 */

export const REFINE_CRITERIA_SYSTEM_PROMPT = `You are an AI Sourcing Refinement Specialist at Flexiple.
Your role is to adjust objective filters and the subjective rubric based on the recruiter's explicit feedback on candidates.

REFINEMENT GUIDELINES:
1. Interpret both conversational feedback (e.g. "1 is too junior, 2 is great, need more fintech") and specific profile reactions.
2. Determine whether each piece of feedback impacts:
   - OBJECTIVE FILTERS: (e.g. increasing min_years_experience, adjusting required_skills, adding/removing company_types or locations).
   - SUBJECTIVE RUBRIC: (e.g. changing weights, refining what good looks like, adding domain emphasis).
3. EXPLAIN EVERY CHANGE ("What Changed & Why"):
   - For every modification, clearly articulate the specific change and the recruiter-driven rationale.
4. Keep the output strictly valid JSON conforming to the schema below.

SCHEMA:
{
  "changelog": [
    {
      "type": "filters" | "rubric",
      "change": "e.g. Increased minimum experience from 4 to 5 years",
      "rationale": "e.g. Recruiter indicated candidate p01 (4 yrs) was too junior for this senior role"
    }
  ],
  "updated_objective_filters": {
    "min_years_experience": number,
    "max_years_experience": number,
    "locations": string[],
    "required_skills": string[],
    "company_types": string[],
    "keywords": string[]
  },
  "updated_fit_rubric": {
    "ideal_profile_summary": string,
    "evaluation_criteria": [
      {
        "name": string,
        "weight": "high" | "medium" | "low",
        "what_good_looks_like": string
      }
    ]
  }
}`;

export function buildRefineCriteriaUserPrompt(
  currentFilters: ObjectiveFilters,
  currentRubric: FitRubric,
  candidates: ScoredCandidate[],
  recruiterFeedback: string
): string {
  const candidateSummaries = candidates.map((c, idx) => ({
    index: idx + 1,
    id: c.candidate.id,
    name: c.candidate.name,
    experience: c.candidate.years_experience,
    company: c.candidate.current_company,
    company_type: c.candidate.current_company_type,
    skills: c.candidate.skills,
    user_reaction: c.user_feedback || "neutral",
  }));

  return `CURRENT SEARCH STATE:
Current Objective Filters:
${JSON.stringify(currentFilters, null, 2)}

Current Fit Rubric:
${JSON.stringify(currentRubric, null, 2)}

CANDIDATES PREVIOUSLY SHOWN:
${JSON.stringify(candidateSummaries, null, 2)}

RECRUITER FEEDBACK:
"${recruiterFeedback}"

Analyze the feedback, adjust the filters and rubric accordingly, and document the changelog. Output raw JSON only.`;
}
