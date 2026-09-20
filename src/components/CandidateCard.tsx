"use client";

import React, { useState } from "react";
import { ScoredCandidate, FitRubric } from "@/types";
import {
  Briefcase,
  MapPin,
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle,
  Quote,
  Mail,
} from "lucide-react";
import { OutreachModal } from "./OutreachModal";

interface CandidateCardProps {
  index: number;
  scoredCandidate: ScoredCandidate;
  onFeedback: (candidateId: string, feedback: "accepted" | "rejected", note?: string) => void;
  isFrozen: boolean;
  rubric?: FitRubric;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  index,
  scoredCandidate,
  onFeedback,
  isFrozen,
  rubric,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);
  const { candidate, fit_score, match_status, cited_reasons, red_flags_or_tradeoffs, user_feedback } =
    scoredCandidate;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-sky-400 border-sky-500/30 bg-sky-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  const getCompanyTypeBadge = (type: string) => {
    switch (type) {
      case "startup":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      case "scaleup":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
      case "enterprise":
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 backdrop-blur-sm overflow-hidden ${
        user_feedback === "accepted"
          ? "border-emerald-500/40 bg-slate-900/90 shadow-lg shadow-emerald-500/5"
          : user_feedback === "rejected"
          ? "border-rose-500/30 bg-slate-900/60 opacity-75"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-md"
      }`}
    >
      {/* Top Banner / Candidate Identity */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Number Index for chat reference */}
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center shrink-0">
              #{index + 1}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-white">{candidate.name}</h3>
                <span
                  className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-md border ${getCompanyTypeBadge(
                    candidate.current_company_type
                  )}`}
                >
                  {candidate.current_company_type}
                </span>
                {user_feedback === "accepted" && (
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Matches ✓
                  </span>
                )}
                {user_feedback === "rejected" && (
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Rejected ✗
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-indigo-300">{candidate.current_title}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.current_company}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.location}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">
                  {candidate.years_experience} yrs exp
                </span>
              </div>
            </div>
          </div>

          {/* Fit Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`px-2.5 py-1 rounded-xl border font-bold text-xs flex items-center gap-1 ${getScoreColor(
                fit_score
              )}`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{fit_score}% Fit</span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 mt-1 tracking-wider">
              {match_status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Candidate Summary */}
        <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          "{candidate.summary}"
        </p>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {candidate.skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* CITED MATCH EXPLANATIONS (MANDATORY ASSIGNMENT REQUIREMENT) */}
      <div className="p-4 bg-slate-950/40 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <Quote className="w-3 h-3 text-indigo-400" />
          <span>Why this candidate matched (Profile Field Citations):</span>
        </div>

        <div className="grid gap-2">
          {cited_reasons.map((reason, rIdx) => (
            <div
              key={rIdx}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-start gap-2.5"
            >
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0 mt-0.5">
                {reason.field.replace("_", " ")}
              </span>
              <div className="space-y-0.5">
                <p className="text-slate-200">
                  <strong className="text-white font-medium">"{reason.quote_or_value}"</strong> — {reason.reason}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Red flags or tradeoffs */}
        {red_flags_or_tradeoffs && red_flags_or_tradeoffs.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs flex items-start gap-2 text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-400">Tradeoffs / Nuances: </span>
              {red_flags_or_tradeoffs.join(", ")}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Past Companies & Education */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-xs space-y-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Career Timeline
            </span>
            <div className="space-y-1.5">
              {candidate.past_companies.map((past, pIdx) => (
                <div key={pIdx} className="flex items-center justify-between text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span>
                    <strong className="text-white">{past.company}</strong> ({past.company_type}) — {past.title}
                  </span>
                  <span className="text-slate-400">{past.years} yrs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>{candidate.education}</span>
          </div>
        </div>
      )}

      {/* Card Footer: Expand toggle + Recruiter Yes/No Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Less details</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>View career history</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* X-Factor: 1-Click Outreach Email */}
          <button
            onClick={() => setShowOutreach(true)}
            className="text-xs text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            title="Generate personalized recruiter outreach pitch"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Draft Outreach</span>
          </button>

          {!isFrozen && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onFeedback(candidate.id, "accepted", "Strong profile fit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  user_feedback === "accepted"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-700"
                }`}
                title="Matches requirements"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Matches</span>
              </button>

              <button
                onClick={() => onFeedback(candidate.id, "rejected", "Not a fit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  user_feedback === "rejected"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 border border-slate-700"
                }`}
                title="Does not match"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Not a Match</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Outreach Drafter Modal */}
      {showOutreach && rubric && (
        <OutreachModal
          candidate={candidate}
          rubric={rubric}
          onClose={() => setShowOutreach(false)}
        />
      )}
    </div>
  );
};
