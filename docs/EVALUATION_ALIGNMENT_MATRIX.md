# Evaluation Criteria Alignment Matrix
## Flexiple Engineering Challenge: The Sourcing Refinement Loop

This matrix explicitly maps every evaluation requirement outlined in the Flexiple challenge brief to its concrete implementation in this repository.

---

| Flexiple Evaluation Requirement | How It Was Solved | Implementation Location |
|---|---|---|
| **1. Real server-side LLM API calls (no mocks)** | Server-side API routes using Groq Cloud SDK (`openai/gpt-oss-120b`) with Google Gemini 1.5 Flash fallback. | [src/lib/llm/client.ts](file:///Users/devanshbhargava/programming/Assignment/src/lib/llm/client.ts) |
| **2. Prompts visible in repository** | All prompts are modularized into dedicated files for transparent code review. | [src/lib/prompts/](file:///Users/devanshbhargava/programming/Assignment/src/lib/prompts/) |
| **3. Structured Output & Validation** | JSON mode enforced via LLM parameters and validated with resilient JSON parser (`cleanAndParseJSON`). | [src/lib/llm/client.ts](file:///Users/devanshbhargava/programming/Assignment/src/lib/llm/client.ts#L17) |
| **4. Explanations cite actual profile fields** | Scoring prompt mandates quoting real fields (`skills`, `summary`, `current_company`). Displayed as cited tags on candidate cards. | [src/lib/prompts/scoreCandidates.ts](file:///Users/devanshbhargava/programming/Assignment/src/lib/prompts/scoreCandidates.ts) & [src/components/CandidateCard.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/CandidateCard.tsx) |
| **5. Deterministic local filtering** | Objective filters are applied locally in TypeScript against `profiles.json` before LLM scoring. | [src/lib/filterEngine.ts](file:///Users/devanshbhargava/programming/Assignment/src/lib/filterEngine.ts) |
| **6. Visible & Editable Criteria/Rubric** | Filters and rubric are always visible in the left panel with direct interactive inputs and steppers. | [src/components/CriteriaEditor.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/CriteriaEditor.tsx) |
| **7. Conversational Refinement Loop** | Recruiter provides chat feedback; AI responds with an explicit "What Changed & Why" changelog and updates criteria. | [src/app/api/refine/route.ts](file:///Users/devanshbhargava/programming/Assignment/src/app/api/refine/route.ts) & [src/components/RefinementBar.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/RefinementBar.tsx) |
| **8. Graceful Failure & Recovery Demo** | Handles rate limits (429), timeouts, and malformed outputs with auto-retry countdown. Interactive "Simulate Failure" menu for demo. | [src/components/ErrorRecoveryBanner.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/ErrorRecoveryBanner.tsx) & [src/components/Header.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/Header.tsx) |
| **9. Freeze Search State** | Locks criteria and presents a final ranked shortlist with one-click export for ATS handoff. | [src/components/FrozenView.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/FrozenView.tsx) |
| **10. Standout X-Factor Features** | 1-click AI Personalized Outreach Pitch Drafter (`✨ Draft Outreach`) + Visual Sourcing Funnel Bar. | [src/components/OutreachModal.tsx](file:///Users/devanshbhargava/programming/Assignment/src/components/OutreachModal.tsx) & [src/app/page.tsx](file:///Users/devanshbhargava/programming/Assignment/src/app/page.tsx) |
