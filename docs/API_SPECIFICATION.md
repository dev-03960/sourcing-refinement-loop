# API Specification: Sourcing Refinement Loop

This document outlines the REST API endpoints powering the Flexiple AI Recruiter application.

---

## 1. `POST /api/search`
Translates a natural language query into objective filters and an evaluation rubric, applies deterministic filtering on `profiles.json`, and scores top candidate profiles.

### Request Body:
```json
{
  "query": "RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore.",
  "manualFilters": null,
  "manualRubric": null,
  "forceError": null
}
```

### Response Body (`200 OK`):
```json
{
  "filters": {
    "min_years_experience": 4,
    "max_years_experience": 7,
    "locations": ["Bangalore"],
    "required_skills": ["AWS RDS"],
    "company_types": ["startup"],
    "keywords": ["RDS", "database"]
  },
  "rubric": {
    "ideal_profile_summary": "A Bangalore-based developer with 4-7 years of experience...",
    "evaluation_criteria": [
      {
        "name": "Startup Ownership",
        "weight": "high",
        "what_good_looks_like": "Hands-on scaling of database-backed products in early startups"
      }
    ]
  },
  "candidates": [
    {
      "candidate": {
        "id": "p02",
        "name": "Rohan Sharma",
        "current_title": "Backend Engineer",
        "years_experience": 7,
        "location": "Bangalore",
        "current_company": "NimbusPay",
        "current_company_type": "startup",
        "skills": ["Python", "Django", "MySQL", "AWS RDS", "Celery"],
        "summary": "..."
      },
      "fit_score": 88,
      "match_status": "strong_match",
      "cited_reasons": [
        {
          "field": "skills",
          "quote_or_value": "\"AWS RDS\"",
          "reason": "Explicit AWS RDS skill demonstrates core RDS expertise."
        }
      ]
    }
  ],
  "totalPoolCount": 48,
  "passedFilterCount": 6
}
```

---

## 2. `POST /api/refine`
Analyzes recruiter feedback, updates objective filters and the fit rubric, generates a transparent changelog, and re-ranks the talent pool.

### Request Body:
```json
{
  "currentFilters": { ... },
  "currentRubric": { ... },
  "candidates": [ ... ],
  "recruiterFeedback": "Candidate #1 is too junior. We need at least 5 years of experience.",
  "forceError": null
}
```

### Response Body (`200 OK`):
```json
{
  "changelog": [
    {
      "type": "filters",
      "change": "Increased minimum experience from 4 to 5 years",
      "rationale": "Recruiter indicated candidate #1 was too junior for this role"
    }
  ],
  "updated_objective_filters": {
    "min_years_experience": 5,
    ...
  },
  "updated_fit_rubric": { ... },
  "candidates": [ ... ],
  "totalPoolCount": 48,
  "passedFilterCount": 4
}
```

---

## 3. `POST /api/outreach`
Generates a hyper-personalized recruiter email to a candidate citing their exact profile experience.

### Request Body:
```json
{
  "candidate": { ... },
  "rubric": { ... },
  "roleTitle": "Senior Backend / Cloud Database Engineer"
}
```

### Response Body (`200 OK`):
```json
{
  "pitch": {
    "subject": "Building the next data-first startup? Let's chat, Ananya",
    "body": "Hi Ananya, I'm impressed by your work at NimbusPay...",
    "call_to_action": "Would you be open to a quick 15-minute call next week?"
  }
}
```
