import React from "react";
import { ArrowUpDown, Check, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkillItem } from "../types/resume-builder";
import { evaluateSkillRelevance } from "../utils/resume-improvements";

interface SkillRelevancePanelProps {
  skills: SkillItem[];
  targetRole: string;
  onApplyOrdering: () => void;
  onClose: () => void;
}

export function SkillRelevancePanel({
  skills,
  targetRole,
  onApplyOrdering,
  onClose,
}: SkillRelevancePanelProps) {
  const { recommendedOrder, lessRelevantOrder, hasMisordering } = evaluateSkillRelevance(
    skills,
    targetRole
  );

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Skills Relevance</h4>
            <p className="text-xs text-muted-foreground">
              Target role: <span className="font-semibold text-indigo-400">{targetRole || "Not set"}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {recommendedOrder.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> High Target-Role Relevance:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recommendedOrder.map((name) => (
              <span
                key={name}
                className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/20"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {lessRelevantOrder.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">Secondary / Less Relevant:</p>
          <div className="flex flex-wrap gap-1.5">
            {lessRelevantOrder.map((name) => (
              <span
                key={name}
                className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
          Keep Current
        </Button>
        <Button
          size="sm"
          onClick={() => {
            onApplyOrdering();
            onClose();
          }}
          disabled={!hasMisordering}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
          Apply Recommended Ordering
        </Button>
      </div>
    </div>
  );
}
