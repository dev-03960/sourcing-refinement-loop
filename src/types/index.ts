export type CompanyType = "startup" | "scaleup" | "enterprise" | "agency";

export interface PastCompany {
  company: string;
  company_type: CompanyType;
  title: string;
  years: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  current_title: string;
  years_experience: number;
  location: string;
  current_company: string;
  current_company_type: CompanyType;
  skills: string[];
  past_companies: PastCompany[];
  education: string;
  summary: string;
}

export interface ObjectiveFilters {
  min_years_experience: number;
  max_years_experience: number;
  locations: string[];
  required_skills: string[];
  company_types: CompanyType[];
  keywords: string[];
}

export interface RubricCriterion {
  name: string;
  weight: "high" | "medium" | "low";
  what_good_looks_like: string;
}

export interface FitRubric {
  ideal_profile_summary: string;
  evaluation_criteria: RubricCriterion[];
}

export interface CitedReason {
  field: "skills" | "experience" | "company_background" | "summary" | "education";
  quote_or_value: string;
  reason: string;
}

export interface ScoredCandidate {
  candidate: CandidateProfile;
  fit_score: number; // 0 to 100
  match_status: "strong_match" | "potential_match" | "weak_match";
  cited_reasons: CitedReason[];
  red_flags_or_tradeoffs?: string[];
  user_feedback?: "accepted" | "rejected" | "neutral";
  feedback_notes?: string;
}

export interface ChangelogItem {
  type: "filters" | "rubric";
  change: string;
  rationale: string;
}

export interface RefinementHistoryItem {
  id: string;
  timestamp: string;
  user_feedback: string;
  changelog: ChangelogItem[];
}

export interface SearchSessionState {
  isInitial: boolean;
  query: string;
  filters: ObjectiveFilters;
  rubric: FitRubric;
  candidates: ScoredCandidate[];
  totalPoolCount: number;
  passedFilterCount: number;
  isThinking: boolean;
  thinkingStage?: "extracting" | "filtering" | "scoring" | "refining";
  isFrozen: boolean;
  history: RefinementHistoryItem[];
  error?: {
    message: string;
    type: "rate_limit" | "malformed_output" | "timeout" | "server_error";
    retryable: boolean;
  } | null;
}
