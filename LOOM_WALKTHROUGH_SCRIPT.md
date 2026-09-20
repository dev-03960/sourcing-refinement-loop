# 🎥 5-Minute Loom Walkthrough Script: Sourcing Refinement Loop
**Candidate Walkthrough Guide for Flexiple Engineering Challenge**  
**Recording Target:** 4 Minutes 30 Seconds (Buffer for Loom's 5-minute free limit)

---

## ⏱️ Scene-by-Scene Script & Action Blueprint

```
┌────────────┬──────────────────────────────────┬────────────────────────────────────────────┐
│ Timestamp  │ Screen Action                    │ Talking Points (Spoken Script)             │
├────────────┼──────────────────────────────────┼────────────────────────────────────────────┤
│ 0:00 - 0:30│ Codebase & Home UI               │ Architecture, Tech Stack, & Prompts Folder │
│ 0:30 - 1:15│ Click Challenge Query ➔ Search   │ Natural Language to Structured Criteria    │
│ 1:15 - 2:00│ Candidate Cards & Citations      │ Local Deterministic Filter & Cited Scores  │
│ 2:00 - 3:00│ Type Chat Feedback ➔ Refine Loop │ Dynamic AI Changelog & Re-scoring          │
│ 3:00 - 3:45│ Click "Simulate Failure" Dropdown│ 429 Rate Limit Interception & Auto-Retry   │
│ 3:45 - 4:15│ Click "Draft Outreach" Button    │ X-Factor: AI Personalized Reachout Email   │
│ 4:15 - 4:40│ Click "Freeze Search" ➔ Export   │ Locked Executive Dossier & Export Shortlist│
└────────────┴──────────────────────────────────┴────────────────────────────────────────────┘
```

---

### **Segment 1: Introduction & Architecture (0:00 – 0:30)**
* **Screen:** Browser at `http://localhost:3000` with VS Code visible in split or quick alt-tab.
* **Action:** Point out header stats (`Talent Pool: 48 profiles | Status: Live`).
* **Script:**
  > *"Hi everyone, welcome to my walkthrough of the Flexiple AI Recruiter Sourcing Refinement Loop. I built this full-stack application using Next.js with TypeScript and Tailwind CSS, powered by Groq's high-speed LLM inference on the server side. All prompts are cleanly organized in `src/lib/prompts/` for full evaluation transparency. Let's dive into the live experience."*

---

### **Segment 2: Free Text to Criteria & Rubric (0:30 – 1:15)**
* **Screen:** Landing Search page.
* **Action:** Click the first challenge prompt chip:
  > *"RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore."*  
  Then click **"Source Candidates"**.
* **Script:**
  > *"First, as a recruiter, I start with natural language. As the AI extracts the requirements, notice how it decomposes the request into two distinct layers:
  > 1. Objective Filters: 4 to 7 years of experience, Bangalore location, AWS RDS skill, and startup company background.
  > 2. A Subjective Fit Rubric: Outlining our target archetype and what good looks like across startup ownership and database depth.
  > These filters are always visible on the left and directly editable with these fine-grained stepper controls."*

---

### **Segment 3: Local Filtering & Cited Candidate Scoring (1:15 – 2:00)**
* **Screen:** Candidate feed on the right side.
* **Action:** Point to the **Sourcing Funnel Bar** at the top (`Total Pool: 48 ➔ Passed: 6 ➔ Ranked: 5`), then scroll down Candidate Card #1 and #2. Hover over the **"Why this candidate matched"** citation box.
* **Script:**
  > *"Under the hood, we first ran a fast, deterministic local filter against the 48 candidate profiles, cutting down to viable matches. Then, the LLM scored the top candidates against the rubric.
  > Crucially, every evaluation cites exact profile fields rather than generic praise. For example, for Rohan and Ananya, it cites their exact skills like AWS RDS, their work at NimbusPay, and quotes their startup summaries. We also surface nuances like agency tradeoffs."*

---

### **Segment 4: The Conversational Refinement Loop (2:00 – 3:00)**
* **Screen:** Bottom "Refine in Conversation" chat bar.
* **Action:** Type in chat:
  > `Candidate #1 is too junior. We need at least 5+ years of experience and deep PostgreSQL internals.`  
  Click **"Refine Loop"**.
* **Script:**
  > *"Now for the core of the assignment: the refinement loop. In chat, I tell the recruiter: 'Candidate 1 is too junior, we need at least 5+ years of experience and deep PostgreSQL internals.'
  > Notice what happens:
  > 1. An explicit AI Changelog appears, explaining what changed and why—raising minimum experience from 4 to 5 years and tuning the rubric.
  > 2. The left panel filters update automatically.
  > 3. The search immediately re-runs, filtering out the 4-year candidate and displaying a freshly calibrated ranked set."*

---

### **Segment 5: Failure & Recovery Demonstration (3:00 – 3:45)**
* **Screen:** Header navigation bar.
* **Action:** Click **"Simulate Failure"** ➔ Select **"Simulate 429 Rate Limit"**.
* **Script:**
  > *"The assignment brief specifically evaluates graceful error handling. 
  > I built a failure simulator to demonstrate this. When a 429 rate limit or network timeout occurs, the app doesn't crash or lose state. Instead, a graceful recovery banner appears with an automatic 5-second countdown retry and a manual 'Retry Now' button, ensuring recruiter trust is never broken."*

---

### **Segment 6: X-Factor Bonus: 1-Click AI Outreach Drafter (3:45 – 4:15)**
* **Screen:** Candidate Card footer.
* **Action:** Click the **"Draft Outreach"** button on Candidate #1. Show the modal with subject line and personalized email body. Click **"Copy to Clipboard"**, then close modal.
* **Script:**
  > *"As an X-factor feature, I integrated an AI Outreach Drafter. Once a recruiter likes a candidate, they can click 'Draft Outreach' to instantly generate a hyper-personalized, non-spammy email citing the candidate's exact experience and tech stack at their current company, ready to copy in one click."*

---

### **Segment 7: Freeze Search State & Wrap-up (4:15 – 4:40)**
* **Screen:** Top-right header.
* **Action:** Click **"Freeze Search"**. Point out the locked criteria, locked rubric, and click **"Export Shortlist"**.
* **Script:**
  > *"Finally, once satisfied, the recruiter clicks 'Freeze Search'. The search locks into a finalized executive dossier showing locked filters, the finalized rubric, and the ranked shortlist with one-click JSON/markdown export for ATS handoff.
  > The repository is open on GitHub, fully documented in the README, and ready to run. Thank you!"*

---

## 🎯 Pro-Tips Before Hitting Record
1. Keep `http://localhost:3000` open and ready in your browser.
2. Have this document open on your phone or second monitor as a cheat-sheet.
3. Don't worry about speaking fast—the script is designed to comfortably finish in 4 minutes and 30 seconds!
