"use client";

import React, { useState, useEffect } from "react";
import { ObjectiveFilters, FitRubric, CompanyType } from "@/types";
import { SlidersHorizontal, BookOpen, Plus, X, RefreshCw, Check } from "lucide-react";

interface CriteriaEditorProps {
  filters: ObjectiveFilters;
  rubric: FitRubric;
  onApplyManualEdits: (newFilters: ObjectiveFilters, newRubric: FitRubric) => void;
  isLoading: boolean;
  isFrozen: boolean;
}

const ALL_COMPANY_TYPES: CompanyType[] = ["startup", "scaleup", "enterprise", "agency"];

export const CriteriaEditor: React.FC<CriteriaEditorProps> = ({
  filters,
  rubric,
  onApplyManualEdits,
  isLoading,
  isFrozen,
}) => {
  const [localFilters, setLocalFilters] = useState<ObjectiveFilters>(filters);
  const [localRubric, setLocalRubric] = useState<FitRubric>(rubric);
  const [isDirty, setIsDirty] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Sync when props change from server (e.g. after refinement)
  useEffect(() => {
    setLocalFilters(filters);
    setLocalRubric(rubric);
    setIsDirty(false);
  }, [filters, rubric]);

  const handleToggleCompanyType = (type: CompanyType) => {
    if (isFrozen) return;
    const current = localFilters.company_types || [];
    const exists = current.includes(type);
    const updated = exists ? current.filter((t) => t !== type) : [...current, type];
    setLocalFilters({ ...localFilters, company_types: updated });
    setIsDirty(true);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (isFrozen) return;
    setLocalFilters({
      ...localFilters,
      required_skills: localFilters.required_skills.filter((s) => s !== skillToRemove),
    });
    setIsDirty(true);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFrozen || !newSkill.trim()) return;
    if (!localFilters.required_skills.includes(newSkill.trim())) {
      setLocalFilters({
        ...localFilters,
        required_skills: [...localFilters.required_skills, newSkill.trim()],
      });
      setIsDirty(true);
    }
    setNewSkill("");
  };

  const handleRemoveLocation = (locToRemove: string) => {
    if (isFrozen) return;
    setLocalFilters({
      ...localFilters,
      locations: localFilters.locations.filter((l) => l !== locToRemove),
    });
    setIsDirty(true);
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFrozen || !newLocation.trim()) return;
    if (!localFilters.locations.includes(newLocation.trim())) {
      setLocalFilters({
        ...localFilters,
        locations: [...localFilters.locations, newLocation.trim()],
      });
      setIsDirty(true);
    }
    setNewLocation("");
  };

  const handleApply = () => {
    onApplyManualEdits(localFilters, localRubric);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setLocalFilters(filters);
    setLocalRubric(rubric);
    setIsDirty(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 space-y-6 shadow-xl">
      {/* Header & Save Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Live Criteria & Rubric
          </h2>
          {isFrozen && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Locked
            </span>
          )}
        </div>

        {isDirty && !isFrozen && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-md transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>Re-apply Criteria</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. Objective Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Objective Filters (Hard Constraints)
          </span>
          <span className="text-[11px] text-slate-400">Directly editable</span>
        </div>

        {/* Experience Bounds */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Min Experience (Years)
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg overflow-hidden focus-within:border-indigo-500">
              <button
                type="button"
                disabled={isFrozen || isLoading || localFilters.min_years_experience <= 0}
                onClick={() => {
                  const newVal = Math.max(0, localFilters.min_years_experience - 1);
                  setLocalFilters({ ...localFilters, min_years_experience: newVal });
                  setIsDirty(true);
                }}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors text-xs font-bold"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={25}
                disabled={isFrozen || isLoading}
                value={localFilters.min_years_experience === 0 ? "0" : localFilters.min_years_experience}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, ""); // Strip leading zero like 025 -> 25
                  const val = raw === "" ? 0 : Math.min(25, Math.max(0, parseInt(raw, 10) || 0));
                  setLocalFilters({
                    ...localFilters,
                    min_years_experience: val,
                  });
                  setIsDirty(true);
                }}
                className="w-full bg-transparent text-center px-1 py-1.5 text-xs text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-semibold"
              />
              <button
                type="button"
                disabled={isFrozen || isLoading || localFilters.min_years_experience >= 25}
                onClick={() => {
                  const newVal = Math.min(25, localFilters.min_years_experience + 1);
                  setLocalFilters({ ...localFilters, min_years_experience: newVal });
                  setIsDirty(true);
                }}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Max Experience (Years)
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg overflow-hidden focus-within:border-indigo-500">
              <button
                type="button"
                disabled={isFrozen || isLoading || localFilters.max_years_experience <= localFilters.min_years_experience}
                onClick={() => {
                  const newVal = Math.max(localFilters.min_years_experience, localFilters.max_years_experience - 1);
                  setLocalFilters({ ...localFilters, max_years_experience: newVal });
                  setIsDirty(true);
                }}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors text-xs font-bold"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={30}
                disabled={isFrozen || isLoading}
                value={localFilters.max_years_experience === 0 ? "0" : localFilters.max_years_experience}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, ""); // Strip leading zero
                  const val = raw === "" ? 0 : Math.min(30, Math.max(0, parseInt(raw, 10) || 0));
                  setLocalFilters({
                    ...localFilters,
                    max_years_experience: val,
                  });
                  setIsDirty(true);
                }}
                className="w-full bg-transparent text-center px-1 py-1.5 text-xs text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-semibold"
              />
              <button
                type="button"
                disabled={isFrozen || isLoading || localFilters.max_years_experience >= 30}
                onClick={() => {
                  const newVal = Math.min(30, localFilters.max_years_experience + 1);
                  setLocalFilters({ ...localFilters, max_years_experience: newVal });
                  setIsDirty(true);
                }}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Company Types */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Target Company Types
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_COMPANY_TYPES.map((type) => {
              const active = localFilters.company_types?.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  disabled={isFrozen || isLoading}
                  onClick={() => handleToggleCompanyType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    active
                      ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {type} {active && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Target Locations
          </label>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {localFilters.locations?.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs"
              >
                {loc}
                {!isFrozen && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {!isFrozen && (
            <form onSubmit={handleAddLocation} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add location (e.g. Bangalore, Remote)..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </form>
          )}
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Required & Filter Skills
          </label>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {localFilters.required_skills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-xs"
              >
                {skill}
                {!isFrozen && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {!isFrozen && (
            <form onSubmit={handleAddSkill} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add skill (e.g. AWS RDS, Go, Redis)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. Subjective Fit Rubric Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Subjective Fit Rubric (LLM Evaluated)
          </span>
        </div>

        {/* Ideal Profile Summary */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Ideal Profile Archetype
          </label>
          <textarea
            rows={2}
            disabled={isFrozen || isLoading}
            value={localRubric.ideal_profile_summary}
            onChange={(e) => {
              setLocalRubric({ ...localRubric, ideal_profile_summary: e.target.value });
              setIsDirty(true);
            }}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Rubric Criteria List */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Evaluation Criteria & "What Good Looks Like"
          </label>
          {localRubric.evaluation_criteria?.map((criterion, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{criterion.name}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    criterion.weight === "high"
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : criterion.weight === "medium"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {criterion.weight} weight
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {criterion.what_good_looks_like}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
