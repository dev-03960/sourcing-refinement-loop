"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CandidateProfile, FitRubric } from "@/types";
import { Mail, Sparkles, Copy, Check, X, Loader2 } from "lucide-react";

interface OutreachModalProps {
  candidate: CandidateProfile;
  rubric: FitRubric;
  onClose: () => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  candidate,
  rubric,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pitch, setPitch] = useState<{ subject: string; body: string; call_to_action: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate,
          rubric,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate outreach pitch");
      setPitch(data.pitch);
    } catch (err: any) {
      setError(err.message || "Failed to draft email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!pitch) return;
    const text = `Subject: ${pitch.subject}\n\n${pitch.body}\n\n${pitch.call_to_action}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AI Outreach Drafter</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  X-Factor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized pitch for <strong className="text-slate-200">{candidate.name}</strong> ({candidate.current_company})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {isLoading && (
            <div className="py-14 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300">
                Crafting personalized outreach referencing {candidate.name}&apos;s work at {candidate.current_company}...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          {pitch && !isLoading && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-200 font-medium select-all">
                  {pitch.subject}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Personalized Email Body
                </label>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all max-h-60 overflow-y-auto">
                  {pitch.body}
                  {"\n\n"}
                  {pitch.call_to_action}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Regenerate Pitch</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              disabled={isLoading || !pitch}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Email!" : "Copy to Clipboard"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
