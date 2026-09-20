import { CandidateProfile, FitRubric, ObjectiveFilters } from "@/types";

/**
 * Evaluator Requirement: Explanations for why a profile matched must cite actual fields from that profile.
 */

export const SCORE_CANDIDATES_SYSTEM_PROMPT = `You are a Senior Technical Recruiter at Flexiple.
Your role is to evaluate candidate profiles against a Subjective Fit Rubric and rank them.

EVALUATION RULES:
1. Score each candidate objectively from 0 to 100 based on the rubric criteria.
   - 80-100: strong_match
   - 60-79: potential_match
   - 0-59: weak_match
2. CITATION MANDATE (CRITICAL):
   - You MUST cite ACTUAL, EXACT fields from the candidate profile (e.g. current_company, skills, years_experience, past_companies, summary, education).
   - NEVER use generic fluff like "Good communication" or "Strong background" without quoting actual profile details.
   - For every candidate, provide 2-3 cited reasons tying their real profile data directly to the rubric.
3. If there are potential tradeoffs (e.g. slightly low experience, agency background, missing secondary skill), note them under red_flags_or_tradeoffs.
4. Output strictly valid JSON without codeblocks or extra text.

SCHEMA:
{
  "evaluations": [
    {
      "candidate_id": string,
      "fit_score": number,
      "match_status": "strong_match" | "potential_match" | "weak_match",
      "cited_reasons": [
        {
          "field": "skills" | "experience" | "company_background" | "summary" | "education",
          "quote_or_value": string,
          "reason": string
        }
      ],
      "red_flags_or_tradeoffs": string[]
    }
  ]
}`;

export function buildScoreCandidatesUserPrompt(
  candidates: CandidateProfile[],
  rubric: FitRubric,
  filters: ObjectiveFilters
): string {
  return `EVALUATION CONTEXT:
Target Filters:
- Experience: ${filters.min_years_experience} - ${filters.max_years_experience} years
- Locations: ${filters.locations.join(", ") || "Any"}
- Target Company Types: ${filters.company_types.join(", ") || "Any"}
- Required Skills: ${filters.required_skills.join(", ")}

FIT RUBRIC:
Ideal Profile Summary: ${rubric.ideal_profile_summary}
Evaluation Criteria:
${rubric.evaluation_criteria
  .map((c) => `- [${c.weight.toUpperCase()}] ${c.name}: ${c.what_good_looks_like}`)
  .join("\n")}

CANDIDATES TO EVALUATE (${candidates.length}):
${JSON.stringify(
  candidates.map((c) => ({
    id: c.id,
    name: c.name,
    current_title: c.current_title,
    years_experience: c.years_experience,
    location: c.location,
    current_company: c.current_company,
    current_company_type: c.current_company_type,
    skills: c.skills,
    past_companies: c.past_companies,
    education: c.education,
    summary: c.summary,
  })),
  null,
  2
)}

Evaluate and rank each candidate strictly adhering to the JSON schema with specific citations from the profiles. Output raw JSON only.`;
}
