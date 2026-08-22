import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AlertLevel } from "../types/resume-builder";

interface ImprovementAlertProps {
  level: AlertLevel;
  issueCount: number;
  sectionTitle: string;
  onClick: () => void;
  isOpen?: boolean;
}

export function ImprovementAlert({
  level,
  issueCount,
  sectionTitle,
  onClick,
  isOpen = false,
}: ImprovementAlertProps) {
  if (level === "GREEN") {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
        title={`${sectionTitle}: Strong. No critical issues.`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Strong</span>
      </div>
    );
  }

  const isRed = level === "RED";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={`Show ${issueCount} improvement recommendations for ${sectionTitle}`}
      className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isRed
          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 focus:ring-rose-500"
          : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 focus:ring-amber-500"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
            isRed ? "bg-rose-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isRed ? "bg-rose-500" : "bg-amber-500"
          }`}
        />
      </span>

      {isRed ? (
        <AlertCircle className="h-3.5 w-3.5" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5" />
      )}

      <span>{issueCount} {issueCount === 1 ? "Issue" : "Issues"}</span>
    </button>
  );
}
