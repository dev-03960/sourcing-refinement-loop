"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { CriteriaEditor } from "@/components/CriteriaEditor";
import { CandidateCard } from "@/components/CandidateCard";
import { RefinementBar } from "@/components/RefinementBar";
import { FrozenView } from "@/components/FrozenView";
import { ErrorRecoveryBanner } from "@/components/ErrorRecoveryBanner";
import {
  ObjectiveFilters,
  FitRubric,
  ScoredCandidate,
  ChangelogItem,
  RefinementHistoryItem,
} from "@/types";
import { Loader2, Sparkles, FilterX, Users } from "lucide-react";

export default function Home() {
  const [hasSearched, setHasSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);

  // Core Search State
  const [filters, setFilters] = useState<ObjectiveFilters>({
    min_years_experience: 0,
    max_years_experience: 20,
    locations: [],
    required_skills: [],
    company_types: [],
    keywords: [],
  });

  const [rubric, setRubric] = useState<FitRubric>({
    ideal_profile_summary: "",
    evaluation_criteria: [],
  });

  const [candidates, setCandidates] = useState<ScoredCandidate[]>([]);
  const [totalPoolCount, setTotalPoolCount] = useState(48);
  const [passedFilterCount, setPassedFilterCount] = useState(0);

  // Refinement history and changelog
  const [latestChangelog, setLatestChangelog] = useState<ChangelogItem[]>([]);
  const [history, setHistory] = useState<RefinementHistoryItem[]>([]);

  // Error handling state
  const [error, setError] = useState<{
    message: string;
    type: "rate_limit" | "malformed_output" | "timeout" | "server_error";
    retryable: boolean;
  } | null>(null);

  // Pending action for retry
  const [lastAction, setLastAction] = useState<(() => Promise<void>) | null>(null);

  /**
   * Step 1: Initial Search (Free text -> Filters + Rubric -> Local filter -> Score)
   */
  const handleInitialSearch = async (queryText: string, forceErrorType?: any) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(queryText);
    setThinkingMessage("Extracting structured filters & subjective fit rubric...");

    const execute = async () => {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: queryText,
            forceError: forceErrorType,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to process search.");
        }

        setFilters(data.filters);
        setRubric(data.rubric);
        setCandidates(data.candidates || []);
        setTotalPoolCount(data.totalPoolCount || 48);
        setPassedFilterCount(data.passedFilterCount || 0);
        setHasSearched(true);
        setLatestChangelog([]);
      } catch (err: any) {
        console.error("Search execution failed:", err);
        const isRate = err.message?.includes("429") || err.message?.includes("Rate limit");
        const isMalformed = err.message?.includes("Malformed");
        const isTimeout = err.message?.includes("timeout");

        let errType: "rate_limit" | "malformed_output" | "timeout" | "server_error" = "server_error";
        if (isRate) errType = "rate_limit";
        else if (isMalformed) errType = "malformed_output";
        else if (isTimeout) errType = "timeout";

        setError({
          message: err.message,
          type: errType,
          retryable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    setLastAction(() => () => handleInitialSearch(queryText));
    await execute();
  };

  /**
   * Manual criteria edit (Recruiter tweaked filters or rubric in the side panel)
   */
  const handleApplyManualEdits = async (newFilters: ObjectiveFilters, newRubric: FitRubric) => {
    setIsLoading(true);
    setError(null);
    setThinkingMessage("Re-filtering talent pool & re-scoring against edited rubric...");

    const execute = async () => {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manualFilters: newFilters,
            manualRubric: newRubric,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update criteria.");
        }

        setFilters(data.filters);
        setRubric(data.rubric);
        setCandidates(data.candidates || []);
        setPassedFilterCount(data.passedFilterCount || 0);
      } catch (err: any) {
        setError({
          message: err.message,
          type: "server_error",
          retryable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    setLastAction(() => () => handleApplyManualEdits(newFilters, newRubric));
    await execute();
  };

  /**
   * Step 4: Refinement Loop in Conversation
   */
  const handleRefine = async (feedbackText: string, forceErrorType?: any) => {
    setIsLoading(true);
    setError(null);
    setThinkingMessage("Analyzing recruiter feedback & adjusting criteria...");

    const execute = async () => {
      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentFilters: filters,
            currentRubric: rubric,
            candidates,
            recruiterFeedback: feedbackText,
            forceError: forceErrorType,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to refine search.");
        }

        setFilters(data.updated_objective_filters);
        setRubric(data.updated_fit_rubric);
        setCandidates(data.candidates || []);
        setPassedFilterCount(data.passedFilterCount || 0);

        if (data.changelog && data.changelog.length > 0) {
          setLatestChangelog(data.changelog);
          setHistory((prev) => [
            {
              id: Date.now().toString(),
              timestamp: new Date().toLocaleTimeString(),
              user_feedback: feedbackText,
              changelog: data.changelog,
            },
            ...prev,
          ]);
        }
      } catch (err: any) {
        console.error("Refinement execution failed:", err);
        const isRate = err.message?.includes("429") || err.message?.includes("Rate limit");
        const isMalformed = err.message?.includes("Malformed");
        const isTimeout = err.message?.includes("timeout");

        let errType: "rate_limit" | "malformed_output" | "timeout" | "server_error" = "server_error";
        if (isRate) errType = "rate_limit";
        else if (isMalformed) errType = "malformed_output";
        else if (isTimeout) errType = "timeout";

        setError({
          message: err.message,
          type: errType,
          retryable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    setLastAction(() => () => handleRefine(feedbackText));
    await execute();
  };

  /**
   * Per-profile Yes/No Reaction handling
   */
  const handleCandidateFeedback = (
    candidateId: string,
    feedback: "accepted" | "rejected",
    note?: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.candidate.id === candidateId
          ? { ...c, user_feedback: feedback, feedback_notes: note }
          : c
      )
    );
  };

  /**
   * Simulate Failure for Loom Walkthrough
   */
  const handleSimulateError = (type: "rate_limit" | "malformed_output" | "timeout") => {
    if (hasSearched) {
      handleRefine("Simulate error test", type);
    } else {
      handleInitialSearch("Simulate error test", type);
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    setCurrentQuery("");
    setCandidates([]);
    setIsFrozen(false);
    setError(null);
    setLatestChangelog([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header
        poolCount={totalPoolCount}
        filteredCount={hasSearched ? passedFilterCount : undefined}
        isFrozen={isFrozen}
        onFreezeToggle={() => setIsFrozen(!isFrozen)}
        onSimulateError={handleSimulateError}
        hasActiveSearch={hasSearched}
        onReset={handleReset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Recovery Banner (Visible on rate limits / timeouts / malformed JSON) */}
        {error && (
          <ErrorRecoveryBanner
            error={error}
            onRetry={() => {
              if (lastAction) {
                lastAction();
              }
            }}
            onDismiss={() => setError(null)}
          />
        )}

        {/* State 1: First Load / Initial Search Bar */}
        {!hasSearched && !isLoading && (
          <SearchSection onSearch={handleInitialSearch} isLoading={isLoading} />
        )}

        {/* State 2: Thinking Moments with Animated Status */}
        {isLoading && (
          <div className="py-24 text-center max-w-md mx-auto space-y-4 animate-fade-in">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                AI Recruiter Processing
              </h3>
              <p className="text-xs text-slate-400 mt-1">{thinkingMessage}</p>
            </div>
            <div className="flex justify-center gap-1.5 pt-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce" />
            </div>
          </div>
        )}

        {/* State 5: Frozen Search State */}
        {hasSearched && !isLoading && isFrozen && (
          <FrozenView
            filters={filters}
            rubric={rubric}
            candidates={candidates}
            onUnlock={() => setIsFrozen(false)}
          />
        )}

        {/* State 3 & 4: Active Sourcing & Refinement Loop Workspace */}
        {hasSearched && !isLoading && !isFrozen && (
          <div className="space-y-6 animate-fade-in">
            {/* Compact Search Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex-1">
                <SearchSection
                  compact={true}
                  onSearch={handleInitialSearch}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Editable Criteria & Rubric (4 cols) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                <CriteriaEditor
                  filters={filters}
                  rubric={rubric}
                  onApplyManualEdits={handleApplyManualEdits}
                  isLoading={isLoading}
                  isFrozen={isFrozen}
                />
              </div>

              {/* Right Column: Candidates & Refinement Loop (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Refinement Conversation Bar */}
                <RefinementBar
                  onRefine={handleRefine}
                  isLoading={isLoading}
                  isFrozen={isFrozen}
                  latestChangelog={latestChangelog}
                  history={history}
                />

                {/* Candidate Results Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Ranked Matches ({candidates.length} Profiles)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    Showing top scored profiles against rubric
                  </span>
                </div>

                {/* Empty State if 0 candidates match hard filters */}
                {candidates.length === 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                      <FilterX className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white">No Matching Profiles Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      None of the 48 candidate profiles satisfied all hard filters. Try relaxing minimum experience or removing strict skill constraints in the Criteria Editor.
                    </p>
                    <button
                      onClick={() =>
                        handleApplyManualEdits(
                          { ...filters, min_years_experience: 0, required_skills: [] },
                          rubric
                        )
                      }
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Loosen Hard Filters
                    </button>
                  </div>
                )}

                {/* Sourcing Funnel (X-Factor: Visual Talent Pipeline) */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-slate-400">Total Pool:</span>
                    <strong className="text-white">{totalPoolCount}</strong>
                  </div>
                  <span className="text-slate-600">➔</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-slate-400">Hard Filter Passed:</span>
                    <strong className="text-sky-300">{passedFilterCount}</strong>
                  </div>
                  <span className="text-slate-600">➔</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-slate-400">Rubric Ranked:</span>
                    <strong className="text-indigo-300">{candidates.length}</strong>
                  </div>
                  <span className="text-slate-600">➔</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">Shortlisted:</span>
                    <strong className="text-emerald-300">
                      {candidates.filter((c) => c.user_feedback === "accepted").length}
                    </strong>
                    {candidates.filter((c) => c.user_feedback === "rejected").length > 0 && (
                      <span className="text-rose-400 text-[11px]">
                        ({candidates.filter((c) => c.user_feedback === "rejected").length} rejected)
                      </span>
                    )}
                  </div>
                </div>

                {/* Candidate Feed */}
                <div className="space-y-4">
                  {candidates.map((scoredCandidate, idx) => (
                    <CandidateCard
                      key={scoredCandidate.candidate.id}
                      index={idx}
                      scoredCandidate={scoredCandidate}
                      onFeedback={handleCandidateFeedback}
                      isFrozen={isFrozen}
                      rubric={rubric}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
