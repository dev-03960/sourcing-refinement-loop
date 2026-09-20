"use client";

import React, { useState } from "react";
import { Search, ArrowRight, Loader2, Compass } from "lucide-react";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

const SAMPLE_QUERIES = [
  "RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore.",
  "Senior Frontend engineers with React and TypeScript from scaleups, Bangalore or Remote.",
  "Python or Go backend engineers with 3-6 years experience in payments or fintech startups.",
];

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isLoading,
  compact = false,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (sample: string) => {
    setQuery(sample);
    if (!isLoading) {
      onSearch(sample);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Refine or start a new candidate search requirement..."
          disabled={isLoading}
          className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-24 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
          <span>Search</span>
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-center py-10 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
        <Compass className="w-3.5 h-3.5" />
        <span>Step 1: Free Text Search</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Source candidates naturally with <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">AI Refinement</span>
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
        Describe your ideal candidate in plain English. The AI extracts structured filters and an evaluation rubric, then iterates with your feedback.
      </p>

      {/* Main Search Input */}
      <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto mb-6">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
        <div className="relative flex items-center bg-slate-900/90 rounded-2xl border border-slate-700/80 p-1.5 shadow-2xl">
          <div className="pl-3.5 pr-2">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore."
            disabled={isLoading}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none py-2 pr-3"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <span>Source Candidates</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sample Starters */}
      <div className="text-left max-w-2xl mx-auto">
        <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">
          Or try a challenge prompt:
        </p>
        <div className="flex flex-col gap-2">
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(sample)}
              disabled={isLoading}
              className="text-left text-xs text-slate-300 hover:text-indigo-300 bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/30 px-3.5 py-2 rounded-xl transition-colors duration-150 flex items-center justify-between group"
            >
              <span className="truncate pr-2">{sample}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
