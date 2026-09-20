# Product Requirement Document (PRD)
## AI Recruiter: The Sourcing Refinement Loop
**Author:** Devansh Bhargava  
**Target Delivery:** Flexiple Engineering Challenge  

---

## 1. Executive Summary

Traditional applicant tracking and talent search systems rely heavily on strict keyword searches (e.g. Boolean strings on LinkedIn), which are notoriously brittle:
* Adding too many keywords returns **0 results**.
* Broadening keywords returns **hundreds of noisy profiles**.
* Sourcing lacks an interactive conversational feedback loop that adapts as recruiters evaluate real candidates.

The **Sourcing Refinement Loop** solves this by bridging natural language recruiter intent with structured objective filtering, rubric-based LLM scoring, and an interactive feedback loop that learns from recruiter reactions.

---

## 2. User Persona & Goals

* **Target Persona:** Senior Tech Recruiter, Head of Talent, Engineering Hiring Manager.
* **Core Goal:** Lock in top 3–5 qualified, high-intent candidates in under 3 feedback iterations.
* **Key Experience Requirements:**
  - Fast response times (<3s).
  - No black-box mystery: Always show **exact citations** for recommendations and a clear **changelog** for adjustments.
  - Direct control: Recruiters must be able to edit filters manually without starting over.

---

## 3. The 5 Product States

| State | User Experience | System Actions |
|---|---|---|
| **1. First Load** | Clean search screen with sample challenge prompt chips. | Ready state; loads talent pool into memory. |
| **2. Thinking State** | Multi-stage status spinner ("Extracting criteria...", "Scoring profiles..."). | Calls LLM extraction, runs local hard filter, triggers cited scoring. |
| **3. Active Workspace** | Two-column split: Editable Criteria & Rubric (Left) + Ranked Candidate Dossiers with Citations (Right). | Displays top 4-5 profiles, renders fit score badges, and cites profile fields. |
| **4. Refinement Loop** | Recruiter chats feedback ("1 is too junior, 2 is right") or clicks per-profile thumbs. | LLM interprets feedback, updates filters/rubric, logs changelog, and re-ranks pool. |
| **5. Frozen State** | Locked dossier view with read-only criteria and exportable shortlist. | Locks criteria, disables editing, formats shortlist for clipboard/ATS handoff. |

---

## 4. X-Factors (Enterprise Recruiter Features)

1. **AI Personalized Outreach Drafter (`✨ Draft Outreach`)**:
   - Allows recruiters to instantly generate a tailored outreach message to any candidate, citing their specific company, years of experience, and tech stack.
2. **Visual Talent Sourcing Funnel**:
   - Real-time pipeline tracker: `[Total Pool: 48] ➔ [Hard Filter Passed] ➔ [Rubric Ranked] ➔ [Shortlisted / Rejected]`.
3. **Interactive Stepper Experience Tuning**:
   - Granular `[-]` and `[+]` experience steppers with automated leading-zero sanitization.
