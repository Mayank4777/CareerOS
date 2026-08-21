import React from "react";
import { Sparkles, Check, X, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AISuggestion, OverallImprovementReport } from "../types/resume-builder";

interface ResumeImprovementModalProps {
  open: boolean;
  onClose: () => void;
  report: OverallImprovementReport;
  suggestions: AISuggestion[];
  onApplySuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  isGeneratingAI?: boolean;
}

export function ResumeImprovementModal({
  open,
  onClose,
  report,
  suggestions,
  onApplySuggestion,
  onRejectSuggestion,
  isGeneratingAI = false,
}: ResumeImprovementModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-border bg-surface-elevated shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-surface">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 text-white shadow-md">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">AI Resume Improvement Report</h3>
              <p className="text-xs text-muted-foreground">
                Review targeted suggestions to elevate impact and target role alignment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Overview Badges */}
        <div className="grid grid-cols-3 gap-3 px-6 py-3 bg-surface-dark/30 border-b border-border/60">
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-2.5 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold">{report.criticalCount} Critical</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-2.5 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold">{report.recommendedCount} Recommended</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold">{report.strongCount} Strong Areas</span>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No pending AI suggestions available. Click &quot;Improve with AI&quot; on a specific section to generate targeted suggestions.
            </div>
          ) : (
            suggestions.map((sug) => {
              const isAccepted = sug.state === "accepted";
              const isRejected = sug.state === "rejected";

              return (
                <div
                  key={sug.id}
                  className={`rounded-2xl border p-4 space-y-3 transition-all ${
                    isAccepted
                      ? "border-emerald-500/40 bg-emerald-500/5 opacity-80"
                      : isRejected
                      ? "border-border/40 bg-surface/40 opacity-50"
                      : "border-border bg-surface shadow-sm hover:border-indigo-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {sug.itemTitle || sug.sectionKey}
                    </span>
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <Check className="h-3.5 w-3.5" /> Applied
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-xs font-medium text-muted-foreground">Ignored</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground italic">Reason: {sug.reason}</p>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                      <p className="font-semibold text-rose-400 mb-1">Current:</p>
                      <p className="text-muted-foreground">{sug.originalText}</p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <p className="font-semibold text-emerald-400 mb-1">AI Suggestion:</p>
                      <p className="text-foreground font-medium">{sug.suggestedText}</p>
                    </div>
                  </div>

                  {sug.state === "pending" && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRejectSuggestion(sug.id)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Ignore
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onApplySuggestion(sug.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Apply Suggestion
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border/80 bg-surface">
          <Button variant="secondary" size="sm" onClick={onClose} className="font-semibold">
            Done Reviewing
          </Button>
        </div>
      </div>
    </div>
  );
}
