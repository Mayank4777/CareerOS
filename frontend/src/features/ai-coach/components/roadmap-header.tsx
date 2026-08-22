import { Link } from "react-router-dom";
import {
  Briefcase,
  Layers,
  MapPin,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Plus,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { APP_ROUTES } from "@/constants/routes";
import type { SavedJob } from "@/features/jobs/types";
import type { CareerRoadmap } from "../types";

interface RoadmapHeaderProps {
  roadmap: CareerRoadmap;
  allRoadmaps?: CareerRoadmap[];
  targetSavedJob?: SavedJob | null;
  onSelectRoadmap?: (roadmapId: string) => void;
  onNewRoadmapClick?: () => void;
}

export function RoadmapHeader({
  roadmap,
  allRoadmaps = [],
  targetSavedJob,
  onSelectRoadmap,
  onNewRoadmapClick,
}: RoadmapHeaderProps) {
  const getStatusTone = (status: CareerRoadmap["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "archived":
        return "warning";
      default:
        return "neutral";
    }
  };

  const formattedStatus = roadmap.status.replace("_", " ");
  const phaseCount = roadmap.phases?.length ?? 0;

  return (
    <div className="p-6 bg-surface border border-border rounded-2xl space-y-5 shadow-xs">
      {/* Top Bar: Selector / Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info" className="uppercase tracking-wider text-[10px] font-bold">
              Career Roadmap
            </Badge>
            <Badge tone={getStatusTone(roadmap.status)} className="capitalize text-[11px]">
              {formattedStatus}
            </Badge>
            <span className="text-xs text-secondary font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-muted" />
              {phaseCount} {phaseCount === 1 ? "Phase" : "Phases"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
            {roadmap.title}
          </h2>
        </div>

        {/* Roadmap Switcher / New Action */}
        <div className="flex items-center gap-2 shrink-0">
          {allRoadmaps.length > 1 && onSelectRoadmap && (
            <Dropdown triggerLabel="Switch Roadmap">
              {allRoadmaps.map((r) => (
                <DropdownItem
                  key={r.id}
                  onClick={() => onSelectRoadmap(r.id)}
                  className={r.id === roadmap.id ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}
                >
                  {r.target_role ? `${r.title} (${r.target_role})` : r.title}
                </DropdownItem>
              ))}
            </Dropdown>
          )}

          {onNewRoadmapClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewRoadmapClick}
              className="flex items-center gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span>New Roadmap</span>
            </Button>
          )}
        </div>
      </div>

      {/* Target Job Info Card / Link */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-hover/40 p-4 rounded-xl border border-border/80">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Target Role:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {roadmap.target_role || targetSavedJob?.title || "Target Role"}
            </span>
            {targetSavedJob?.company && (
              <span className="text-secondary font-medium">at {targetSavedJob.company}</span>
            )}
          </div>

          {roadmap.description && (
            <p className="text-xs text-secondary leading-relaxed">{roadmap.description}</p>
          )}

          {/* Details metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-secondary pt-1">
            {targetSavedJob?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-muted" />
                {targetSavedJob.location}
              </span>
            )}
            {targetSavedJob?.salaryRange && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-muted" />
                {targetSavedJob.salaryRange}
              </span>
            )}
          </div>
        </div>

        {/* Saved Job link button */}
        <div className="flex items-center md:justify-end">
          <Link
            to={APP_ROUTES.jobsSaved}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-surface hover:bg-hover rounded-lg border border-border transition-colors"
          >
            <span>View Saved Job</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
