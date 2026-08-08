import { ExternalLink, MapPin, DollarSign, Trash2, Edit3, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SavedJob } from "../types";

interface SavedJobCardProps {
  job: SavedJob;
  onEdit: (job: SavedJob) => void;
  onDelete: (jobId: string) => void;
  onStatusChange?: (jobId: string, status: SavedJob["status"]) => void;
}

export function SavedJobCard({ job, onEdit, onDelete, onStatusChange }: SavedJobCardProps) {
  const getBadgeTone = (status: SavedJob["status"]) => {
    switch (status) {
      case "applied":
        return "success";
      case "archived":
        return "neutral";
      default:
        return "info";
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {job.title}
            </h3>
            <p className="text-sm font-medium text-secondary mt-0.5">{job.company}</p>
          </div>
          <Badge tone={getBadgeTone(job.status)} className="capitalize">
            {job.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
          )}
          {job.salaryRange && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {job.salaryRange}
            </span>
          )}
          {job.source && <span className="bg-hover px-2 py-0.5 rounded">{job.source}</span>}
        </div>

        {job.description && (
          <p className="text-sm text-secondary line-clamp-2 mt-2">{job.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              View Job <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onStatusChange && job.status === "saved" && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onStatusChange(job.id, "applied")}
            >
              Mark Applied
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(job)}>
            <Edit3 className="w-4 h-4 text-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-danger hover:text-danger/80"
            onClick={() => onDelete(job.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
