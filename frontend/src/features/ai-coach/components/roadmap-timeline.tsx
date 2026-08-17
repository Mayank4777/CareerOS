import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Target,
  ListTodo,
  CheckSquare,
  Square,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useUpdateRoadmapPhase } from "../hooks/use-ai-coach";
import type { RoadmapPhase, PhaseStatus } from "../types";

interface RoadmapTimelineProps {
  roadmapId: string;
  phases: RoadmapPhase[];
}

export function RoadmapTimeline({ roadmapId, phases }: RoadmapTimelineProps) {
  const toast = useToast();
  const updatePhaseMutation = useUpdateRoadmapPhase();
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);

  // Local interactive toggle state for action item checks (UX convenience; phase status is source of truth)
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  const handleToggleAction = (phaseId: string, actionIndex: number) => {
    const key = `${phaseId}-${actionIndex}`;
    setCheckedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStatusChange = async (phase: RoadmapPhase, newStatus: PhaseStatus) => {
    setUpdatingPhaseId(phase.id);
    try {
      await updatePhaseMutation.mutateAsync({
        roadmapId,
        phaseId: phase.id,
        payload: { status: newStatus },
      });

      const statusLabels: Record<PhaseStatus, string> = {
        upcoming: "Upcoming",
        in_progress: "In Progress",
        completed: "Completed",
      };
      toast.success(
        "Phase Status Updated",
        `"${phase.title}" is now ${statusLabels[newStatus]}.`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update phase status. Please try again.";
      toast.error("Update Error", message);
    } finally {
      setUpdatingPhaseId(null);
    }
  };

  if (!phases || phases.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="w-8 h-8 text-indigo-500/70" />}
        title="No Roadmap Phases Found"
        description="This career roadmap currently has no execution phases defined."
      />
    );
  }

  // Sort phases by ordering
  const sortedPhases = [...phases].sort((a, b) => a.ordering - b.ordering);

  const getPhaseBadgeTone = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Roadmap Milestones & Phases
        </h3>
        <span className="text-xs text-secondary font-medium">
          {sortedPhases.filter((p) => p.status === "completed").length} of {sortedPhases.length}{" "}
          completed
        </span>
      </div>

      {/* Timeline Container */}
      <div className="relative pl-4 sm:pl-8 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-8">
        {sortedPhases.map((phase, idx) => {
          const isUpdating = updatingPhaseId === phase.id && updatePhaseMutation.isPending;
          const isCompleted = phase.status === "completed";
          const isInProgress = phase.status === "in_progress";
          const isUpcoming = phase.status === "upcoming";

          return (
            <div key={phase.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-[25px] sm:-left-[41px] top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : isInProgress
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-100 dark:ring-indigo-950"
                    : "bg-surface border-neutral-300 dark:border-neutral-700 text-secondary"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{phase.ordering || idx + 1}</span>
                )}
              </div>

              {/* Main Phase Card */}
              <Card className="p-5 sm:p-6 space-y-5 transition-shadow hover:shadow-md border-border/80">
                {/* Card Header: Title, Duration, Status, Progression Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={getPhaseBadgeTone(phase.status)}
                        className="uppercase tracking-wider text-[10px] font-bold"
                      >
                        {phase.status.replace("_", " ")}
                      </Badge>

                      {phase.estimated_duration && (
                        <span className="inline-flex items-center gap-1 text-xs text-secondary font-medium">
                          <Clock className="w-3.5 h-3.5 text-muted" />
                          {phase.estimated_duration}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-primary">
                      Phase {phase.ordering || idx + 1}: {phase.title}
                    </h4>
                  </div>

                  {/* Progression Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isUpcoming && (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(phase, "in_progress")}
                        aria-label={`Start Phase ${phase.ordering || idx + 1}`}
                        aria-busy={isUpdating}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Phase</span>
                      </Button>
                    )}

                    {isInProgress && (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(phase, "completed")}
                        aria-label={`Mark Phase ${phase.ordering || idx + 1} as Completed`}
                        aria-busy={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white flex items-center gap-1.5 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </Button>
                    )}

                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(phase, "in_progress")}
                        aria-label={`Reopen Phase ${phase.ordering || idx + 1}`}
                        aria-busy={isUpdating}
                        className="flex items-center gap-1.5 text-xs text-secondary"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description & Objective */}
                <div className="space-y-2 text-xs sm:text-sm text-secondary">
                  {phase.description && (
                    <p className="leading-relaxed text-primary/90">{phase.description}</p>
                  )}

                  {phase.objective && (
                    <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/50 dark:border-indigo-900/40 flex items-start gap-2">
                      <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                          Objective:{" "}
                        </span>
                        <span className="text-indigo-800 dark:text-indigo-300">
                          {phase.objective}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Targeted Skills Tags */}
                {Array.isArray(phase.skills) && phase.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                      Required Skills & Technologies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 text-xs font-medium bg-hover text-primary rounded-lg border border-border/70"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist Actions */}
                <div className="space-y-2.5 pt-2 border-t border-border/60">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                    Actionable Milestones
                  </span>

                  {Array.isArray(phase.actions) && phase.actions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {phase.actions.map((action, aIdx) => {
                        const key = `${phase.id}-${aIdx}`;
                        const isChecked = checkedActions[key] || isCompleted;

                        return (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => handleToggleAction(phase.id, aIdx)}
                            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                              isChecked
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
                                : "bg-surface border-border hover:bg-hover text-primary"
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                            )}
                            <span
                              className={`text-xs leading-snug ${
                                isChecked ? "line-through opacity-80" : ""
                              }`}
                            >
                              {action}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-secondary italic">
                      No specific action steps enumerated for this phase.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
