# Flexiple AI Recruiter: The Sourcing Refinement Loop

A full-stack candidate sourcing and refinement engine built for the **Flexiple Engineering Challenge**.

The system translates natural language recruiter queries into structured objective filters and qualitative fit rubrics, deterministically evaluates a 48-candidate talent pool locally, scores candidates with real LLMs citing specific profile fields, and engages in a conversational refinement loop before locking into a frozen shortlist state.

---

## ⚡ Quick Start (Run Locally in 2 Commands)

### 1. Configure Environment Variable
Create `.env.local` in the project root with **at least one** free LLM API key:

```bash
# Recommended (Super fast inference):
GROQ_API_KEY="gsk_..."
```
*Or use Google Gemini:*
```bash
GEMINI_API_KEY="..."
```
*(Free API keys: [Groq Console](https://console.groq.com/keys) | [Google AI Studio](https://aistudio.google.com/apikey))*

### 2. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 The 5 Core States

1. **Free Text Sourcing (Landing State)**: Clean search interface with clickable prompt starters (e.g. *"RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore"*).
2. **Criteria Extraction (Thinking State)**: LLM extracts structured objective filters (years, locations, company types, skills) and a subjective fit rubric ("what good looks like").
3. **Deterministic Filtering & Cited Scoring**:
   - Local deterministic filter runs against `profiles.json` (48 candidate profiles).
   - Filtered candidate pool is scored against the rubric by the LLM.
   - **Citation Mandate**: Every evaluation cites exact profile fields (`current_company`, `skills`, `years_experience`, `past_companies`).
4. **Conversational Refinement Loop**:
   - Recruiter provides feedback via chat (*"1 is too junior, 2 and 4 are right. Prioritize early startup scale"*) or per-profile Yes/No buttons.
   - AI explains **"What Changed & Why"** in an explicit changelog and re-runs the search with tuned criteria.
   - Live filters and rubric remain **visible and directly editable** at all times.
5. **Freeze Search State**:
   - Recruiter locks the search.
   - Displays read-only criteria, locked rubric, and ranked shortlist with one-click export/copy.

---

## 🛡️ Error Handling & Failure Recovery (Loom Demo)

The assignment requires demonstrating at least one failure or recovery moment (e.g., rate limits, timeouts, malformed responses):

- **Graceful Error Recovery**: All LLM calls have a 15s timeout, schema validation fallbacks, and retry wrappers.
- **Loom Walkthrough Simulator**: Click the **"Simulate Failure"** button in the header navbar to trigger:
  - **429 Rate Limit**: Displays an automatic 5-second countdown retry banner.
  - **Malformed JSON**: Shows schema interception and recovery without app crashes.
  - **15s Timeout**: Shows non-blocking retry banner preserving search state.

---

## 🌟 The "X-Factors" (Enterprise Recruiter Superpowers)

1. **AI Personalized Outreach Pitch Drafter (`✨ Draft Outreach`)**:
   - For every shortlisted candidate, recruiters can click **"Draft Outreach"**.
   - The AI uses the candidate's exact profile details (current company, years of experience, specific tech stack like AWS RDS / Postgres) to draft a hyper-personalized, high-converting recruiter reachout email ready to copy in 1 click.
2. **Visual Sourcing Funnel (Talent Map Pipeline)**:
   - A real-time visual pipeline above candidate results tracking the exact talent map flow:
     `[ 48 Total Pool ] ➔ [ Hard Filter Passed ] ➔ [ Rubric Ranked ] ➔ [ Shortlisted / Rejected ]`.
3. **Interactive Stepper Experience Tuning**:
   - Fine-grained `[-]` and `[+]` year controls with leading-zero sanitization, allowing seamless manual calibration without input glitching.

---

## 📂 Repository Architecture & Prompts

All LLM prompts are isolated in dedicated files for transparency and evaluation:

```text
├── profiles.json                       # 48 candidate profiles dataset
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── search/route.ts         # Query -> Criteria extraction + local filter + LLM scoring
│   │   │   └── refine/route.ts         # Recruiter chat -> Feedback adjustment + re-scoring
│   │   ├── page.tsx                    # State machine orchestrating all 5 states
│   │   └── globals.css                 # Dark modern aesthetic
│   ├── components/
│   │   ├── Header.tsx                  # Status pill, freeze toggle & Loom failure simulator
│   │   ├── SearchSection.tsx           # Free text input & challenge prompt chips
│   │   ├── CriteriaEditor.tsx          # Directly editable filters & rubric side-panel
│   │   ├── CandidateCard.tsx           # Profile cards with exact field citations & match score
│   │   ├── RefinementBar.tsx           # Conversational chat & "What changed & why" changelog
│   │   ├── FrozenView.tsx              # Locked criteria and exportable dossier view
│   │   └── ErrorRecoveryBanner.tsx     # Graceful failure banner with auto-retry
│   ├── lib/
│   │   ├── filterEngine.ts             # Deterministic local candidate filtering logic
│   │   ├── profilesData.ts             # Profile dataset loader
│   │   ├── llm/
│   │   │   └── client.ts               # Resilient Groq & Gemini client with backoff
│   │   └── prompts/                    # Visible prompt engineering (evaluated!)
│   │       ├── extractCriteria.ts      # Zero-shot criteria extraction
│   │       ├── scoreCandidates.ts      # Rubric scoring demanding profile citations
│   │       └── refineCriteria.ts       # Meta-reasoning feedback interpreter
│   └── types/
│       └── index.ts                    # TypeScript data contracts
```

---

## 🎯 Engineering Decisions: What We Prioritised, Cut, and Why

### What We Prioritised:
1. **Deterministic Filter + LLM Scoring Hybrid**:
   - *Why*: Sending all 48 profiles to an LLM on every search iteration is slow, expensive, and prone to hallucinations. By running objective constraints locally first, only viable candidates reach the LLM for rubric evaluation.
2. **Exact Profile Citations**:
   - *Why*: Recruiters distrust generic praise ("great engineer"). Each candidate card highlights exact quotes from `summary`, `current_company`, `skills`, and `past_companies`.
3. **Dual Control (Conversation + Direct Editing)**:
   - *Why*: AI shouldn't be a black box. The recruiter can type conversational feedback *or* directly change numbers/pills in the criteria editor.
4. **Changelog Transparency**:
   - *Why*: When an AI adjusts search parameters, the recruiter must immediately see *what changed and why* to build trust.

### What We Cut:
1. **User Authentication & Session Persistence**:
   - *Why*: Explicitly out of scope per the assignment instructions (*"no login, no persistence across sessions"*). Omitting this allowed 100% focus on UI craftsmanship and LLM refinement fidelity.
2. **External Vector Database (RAG)**:
   - *Why*: The dataset is 48 local candidate records. In-memory TypeScript filtering is microsecond-fast, deterministic, and requires zero external database infrastructure.

---

## 🎥 15-Minute Loom Walkthrough Script

| Time | Topic | Action |
|---|---|---|
| **0:00 - 1:30** | Project Overview & Setup | Show single `npm run dev` startup and `.env.local` config. |
| **1:30 - 4:00** | Free Text to Criteria | Type challenge query; explain extracted filters & subjective rubric. |
| **4:00 - 7:30** | Cited Candidate Scoring | Show top candidates; highlight exact citations (`NimbusPay`, `AWS RDS`, `6 yrs`). |
| **7:30 - 11:00** | The Refinement Loop | Enter feedback: *"1 is too junior, 2 is right, need 5+ yrs"*; show changelog and refreshed list. |
| **11:00 - 13:00**| Failure & Recovery Demo | Click **"Simulate Failure"** (429 Rate Limit); demonstrate countdown retry without crash. |
| **13:00 - 14:30**| Freeze State | Click **Freeze Search**; showcase finalized dossier and export JSON. |
