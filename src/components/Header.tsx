"use client";

import React from "react";
import { Sparkles, Lock, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  poolCount: number;
  filteredCount?: number;
  isFrozen: boolean;
  onFreezeToggle: () => void;
  onSimulateError: (type: "rate_limit" | "malformed_output" | "timeout") => void;
  hasActiveSearch: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  poolCount,
  filteredCount,
  isFrozen,
  onFreezeToggle,
  onSimulateError,
  hasActiveSearch,
  onReset,
}) => {
  const [showSimMenu, setShowSimMenu] = React.useState(false);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">Flexiple</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                AI Recruiter
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Sourcing Refinement Loop</p>
          </div>
        </div>

        {/* Status / Talent pool stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Talent Pool: <strong className="text-white">{poolCount}</strong> profiles</span>
            {filteredCount !== undefined && filteredCount > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <span>Passed: <strong className="text-sky-400">{filteredCount}</strong></span>
              </>
            )}
          </div>

          {/* Loom Demo Helper: Simulate Failure & Recovery */}
          <div className="relative">
            <button
              onClick={() => setShowSimMenu(!showSimMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-300 transition-colors"
              title="Test rate limits and malformed error recovery for Loom walkthrough"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Simulate Failure</span>
            </button>

            {showSimMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs"
                onMouseLeave={() => setShowSimMenu(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Loom Demo Failures
                </div>
                <button
                  onClick={() => {
                    setShowSimMenu(false);
                    onSimulateError("rate_limit");
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>Simulate 429 Rate Limit</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">429</span>
                </button>
                <button
                  onClick={() => {
                    setShowSimMenu(false);
                    onSimulateError("malformed_output");
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>Simulate Malformed Output</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">JSON</span>
                </button>
                <button
                  onClick={() => {
                    setShowSimMenu(false);
                    onSimulateError("timeout");
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>Simulate 15s Timeout</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">15s</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset button */}
          {hasActiveSearch && (
            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset Search"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Freeze / Unfreeze Button */}
          {hasActiveSearch && (
            <button
              onClick={onFreezeToggle}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all shadow-md ${
                isFrozen
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20"
              }`}
            >
              {isFrozen ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Search Frozen (Unlock)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Freeze Search</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
