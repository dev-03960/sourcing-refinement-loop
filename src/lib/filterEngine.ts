import { CandidateProfile, ObjectiveFilters } from "@/types";

export interface FilterResult {
  passed: CandidateProfile[];
  reasonsMap: Map<string, string[]>;
}

/**
 * Normalizes text for lenient fuzzy keyword and skill matching
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Deterministically applies objective filters to the local profiles dataset.
 * Returns candidate profiles that meet the hard criteria.
 */
export function applyObjectiveFilters(
  profiles: CandidateProfile[],
  filters: ObjectiveFilters
): CandidateProfile[] {
  return profiles.filter((p) => {
    // 1. Years of experience check
    if (filters.min_years_experience > 0 && p.years_experience < filters.min_years_experience) {
      return false;
    }
    if (filters.max_years_experience > 0 && p.years_experience > filters.max_years_experience) {
      return false;
    }

    // 2. Location check (case-insensitive substring match)
    if (filters.locations && filters.locations.length > 0) {
      const targetLocs = filters.locations.map((l) => l.toLowerCase().trim());
      const candidateLoc = p.location.toLowerCase().trim();
      const locMatch = targetLocs.some(
        (target) =>
          target === "any" ||
          target === "remote" ||
          candidateLoc.includes(target) ||
          target.includes(candidateLoc)
      );
      if (!locMatch) {
        return false;
      }
    }

    // 3. Company type check (matches current company OR any past company)
    if (filters.company_types && filters.company_types.length > 0) {
      const allowedTypes = new Set(filters.company_types);
      const hasCurrentType = allowedTypes.has(p.current_company_type);
      const hasPastType = p.past_companies.some((past) => allowedTypes.has(past.company_type));
      if (!hasCurrentType && !hasPastType) {
        return false;
      }
    }

    // 4. Skills matching
    // If specific skills are required, candidate should have at least one or more key skills
    if (filters.required_skills && filters.required_skills.length > 0) {
      const candidateSkillsNorm = p.skills.map(normalize);
      const summaryNorm = normalize(p.summary);

      const matchedSkills = filters.required_skills.filter((reqSkill) => {
        const reqNorm = normalize(reqSkill);
        return (
          candidateSkillsNorm.some(
            (cSkill) => cSkill.includes(reqNorm) || reqNorm.includes(cSkill)
          ) || summaryNorm.includes(reqNorm)
        );
      });

      // Require at least 1 overlapping core skill if requirements exist
      if (matchedSkills.length === 0) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Pre-ranks candidates by skill overlap and experience relevance to select
 * the best candidate subset (8-10 candidates) to pass to the LLM for rubric scoring.
 */
export function rankCandidatesForScoring(
  candidates: CandidateProfile[],
  filters: ObjectiveFilters
): CandidateProfile[] {
  return [...candidates].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const reqSkillsNorm = (filters.required_skills || []).map(normalize);

    const aSkillsNorm = a.skills.map(normalize);
    const bSkillsNorm = b.skills.map(normalize);

    reqSkillsNorm.forEach((skill) => {
      if (aSkillsNorm.some((s) => s.includes(skill) || skill.includes(s))) scoreA += 2;
      if (bSkillsNorm.some((s) => s.includes(skill) || skill.includes(s))) scoreB += 2;
    });

    // Bonus for current company matching target company type
    if (filters.company_types && filters.company_types.includes(a.current_company_type)) scoreA += 1;
    if (filters.company_types && filters.company_types.includes(b.current_company_type)) scoreB += 1;

    return scoreB - scoreA;
  });
}
