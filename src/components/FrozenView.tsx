"use client";

import React, { useState } from "react";
import { ObjectiveFilters, FitRubric, ScoredCandidate } from "@/types";
import { Lock, Copy, Check, Share2, Unlock } from "lucide-react";
import { CandidateCard } from "./CandidateCard";

interface FrozenViewProps {
  filters: ObjectiveFilters;
  rubric: FitRubric;
  candidates: ScoredCandidate[];
  onUnlock: () => void;
}

export const FrozenView: React.FC<FrozenViewProps> = ({
  filters,
  rubric,
  candidates,
  onUnlock,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDossier = () => {
    const report = {
      frozen_at: new Date().toISOString(),
      final_filters: filters,
      final_rubric: rubric,
      shortlisted_candidates: candidates.map((c) => ({
        id: c.candidate.id,
        name: c.candidate.name,
        title: c.candidate.current_title,
        company: c.candidate.current_company,
        score: c.fit_score,
        citations: c.cited_reasons,
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Freeze Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Search Frozen: Final Candidate Shortlist</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Locked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              The search criteria and rubric have been finalized. Review the final ranked profiles below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyDossier}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied Dossier!" : "Export Shortlist"}</span>
          </button>
          <button
            onClick={onUnlock}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            title="Unlock search to make changes"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlock</span>
          </button>
        </div>
      </div>

      {/* Frozen Criteria Recap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Frozen Filters */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Locked Objective Filters
          </span>
          <div className="space-y-2 text-xs text-slate-300">
            <div>
              <span className="text-slate-400">Experience: </span>
              <strong className="text-white">{filters.min_years_experience} - {filters.max_years_experience} years</strong>
            </div>
            <div>
              <span className="text-slate-400">Locations: </span>
              <strong className="text-white">{filters.locations.join(", ") || "Any"}</strong>
            </div>
            <div>
              <span className="text-slate-400">Company Types: </span>
              <strong className="text-white capitalize">{filters.company_types.join(", ") || "Any"}</strong>
            </div>
            <div>
              <span className="text-slate-400">Required Skills: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.required_skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Frozen Rubric */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Locked Evaluation Rubric
          </span>
          <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            "{rubric.ideal_profile_summary}"
          </p>
          <div className="space-y-1.5">
            {rubric.evaluation_criteria.map((c, idx) => (
              <div key={idx} className="text-xs text-slate-400 flex items-center justify-between">
                <span>• {c.name}</span>
                <span className="text-[10px] uppercase font-bold text-sky-400">{c.weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shortlisted Candidates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Ranked Shortlist ({candidates.length} Profiles)
          </h3>
        </div>

        <div className="space-y-4">
          {candidates.map((candidate, idx) => (
            <CandidateCard
              key={candidate.candidate.id}
              index={idx}
              scoredCandidate={candidate}
              onFeedback={() => {}}
              isFrozen={true}
              rubric={rubric}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
