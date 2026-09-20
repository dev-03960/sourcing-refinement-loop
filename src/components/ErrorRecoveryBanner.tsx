"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, X, ShieldAlert, Clock } from "lucide-react";

interface ErrorRecoveryBannerProps {
  error: {
    message: string;
    type: "rate_limit" | "malformed_output" | "timeout" | "server_error";
    retryable: boolean;
  };
  onRetry: () => void;
  onDismiss: () => void;
}

export const ErrorRecoveryBanner: React.FC<ErrorRecoveryBannerProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState<number | null>(
    error.type === "rate_limit" ? 5 : null
  );

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      onRetry();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, onRetry]);

  const getBadgeInfo = () => {
    switch (error.type) {
      case "rate_limit":
        return {
          title: "LLM Rate Limit Reached (429)",
          description:
            "The model provider's free-tier rate limit was exceeded. The system has paused and will automatically retry with exponential backoff.",
          badge: "Rate Limit / 429",
          color: "border-amber-500/40 bg-amber-950/40 text-amber-300",
        };
      case "malformed_output":
        return {
          title: "Malformed Response Intercepted",
          description:
            "The LLM returned unstructured formatting. Our schema validation caught it gracefully instead of crashing the application.",
          badge: "Schema Validation Error",
          color: "border-rose-500/40 bg-rose-950/40 text-rose-300",
        };
      case "timeout":
        return {
          title: "Inference Threshold Timeout (15s)",
          description:
            "The model call took longer than expected. You can safely retry without losing current search state.",
          badge: "Timeout",
          color: "border-sky-500/40 bg-sky-950/40 text-sky-300",
        };
      default:
        return {
          title: "Inference Error",
          description: error.message || "An unexpected error occurred during search refinement.",
          badge: "Provider Error",
          color: "border-rose-500/40 bg-rose-950/40 text-rose-300",
        };
    }
  };

  const info = getBadgeInfo();

  return (
    <div
      className={`rounded-2xl border ${info.color} p-4 sm:p-5 backdrop-blur-md shadow-2xl transition-all animate-shake`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white">{info.title}</h4>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700">
                {info.badge}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {info.description}
            </p>

            {countdown !== null && countdown > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium pt-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Auto-retrying in {countdown}s...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {error.retryable && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Now</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
