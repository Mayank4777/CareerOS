import React, { useEffect, useRef } from "react";
import { Sparkles, X, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SectionImprovement } from "../types/resume-builder";

interface ImprovementPopoverProps {
  improvement: SectionImprovement;
  onClose: () => void;
  onImproveWithAI: () => void;
  isGeneratingAI?: boolean;
}

export function ImprovementPopover({
  improvement,
  onClose,
  onImproveWithAI,
  isGeneratingAI = false,
}: ImprovementPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const isRed = improvement.level === "RED";

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Improvement options for ${improvement.title}`}
      className="absolute right-0 top-10 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-surface-elevated p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          {isRed ? (
            <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          ) : (
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          )}
          <h4 className="text-sm font-bold text-foreground">
            Improve {improvement.title}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none"
          aria-label="Close popover"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="my-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Recommended Enhancements:
        </p>
        <ul className="space-y-1.5 text-xs text-foreground">
          {improvement.issues.map((issue) => (
            <li key={issue.id} className="flex items-start gap-2">
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                  issue.severity === "critical" ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <Button
          size="sm"
          onClick={onImproveWithAI}
          disabled={isGeneratingAI}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-700"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 animate-pulse text-amber-300" />
          {isGeneratingAI ? "Generating..." : "Improve with AI"}
        </Button>
      </div>
    </div>
  );
}
