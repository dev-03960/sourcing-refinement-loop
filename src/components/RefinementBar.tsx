"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, CheckCircle2, History } from "lucide-react";
import { ChangelogItem, RefinementHistoryItem } from "@/types";

interface RefinementBarProps {
  onRefine: (feedbackText: string) => void;
  isLoading: boolean;
  isFrozen: boolean;
  latestChangelog?: ChangelogItem[];
  history: RefinementHistoryItem[];
}

const QUICK_FEEDBACK_PROMPTS = [
  "Candidate #1 is too junior for this role.",
  "2 and 4 are great, but need more deep PostgreSQL internals.",
  "Focus strictly on early-stage seed/Series A startups.",
  "Need candidates with at least 5+ years of experience.",
];

export const RefinementBar: React.FC<RefinementBarProps> = ({
  onRefine,
  isLoading,
  isFrozen,
  latestChangelog,
  history,
}) => {
  const [feedback, setFeedback] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim() && !isLoading && !isFrozen) {
      onRefine(feedback.trim());
      setFeedback("");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setFeedback(prompt);
  };

  if (isFrozen) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center text-xs text-slate-400">
        Search criteria are currently frozen. Unlock search in the top bar to continue refining.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/90 backdrop-blur-md p-5 shadow-2xl space-y-4">
      {/* Latest AI Changelog Banner */}
      {latestChangelog && latestChangelog.length > 0 && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>AI Refinement: What Changed & Why</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                <span>{showHistory ? "Hide" : "Past Rounds"} ({history.length})</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {latestChangelog.map((item, idx) => (
              <div key={idx} className="text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">{item.change}</strong>
                  <span className="text-slate-400 block text-[11px]">{item.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable History Drawer */}
      {showHistory && history.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 max-h-48 overflow-y-auto text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Refinement History
          </div>
          {history.map((h, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-indigo-300 font-medium italic">
                Recruiter: "{h.user_feedback}"
              </div>
              {h.changelog.map((c, cIdx) => (
                <div key={cIdx} className="text-slate-400 text-[11px]">
                  • {c.change} ({c.rationale})
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Refinement Chat Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Refine in Conversation</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Tell the AI which candidates match, or how to tune filters
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. 1 is too junior, 2 and 4 are right. Prioritize AWS RDS and early startup scale."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !feedback.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            {isLoading ? (
              <span className="animate-spin">🌀</span>
            ) : (
              <>
                <span>Refine Loop</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Quick feedback:</span>
        {QUICK_FEEDBACK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isLoading}
            className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
