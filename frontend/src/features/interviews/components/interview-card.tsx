import { CalendarDays, Clock, User, Link as LinkIcon, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Interview } from "../types";

interface InterviewCardProps {
  interview: Interview;
  onEdit: (interview: Interview) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: Interview["status"]) => void;
}

export function InterviewCard({ interview, onEdit, onDelete, onStatusChange }: InterviewCardProps) {
  const getStatusTone = (st: Interview["status"]) => {
    switch (st) {
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      case "rescheduled":
        return "warning";
      default:
        return "info";
    }
  };

  const formattedDate = new Date(interview.scheduledAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {interview.round}
            </h3>
            <p className="text-sm font-medium text-secondary mt-0.5">
              {interview.companyName ? `${interview.positionName} at ${interview.companyName}` : "Target Application"}
            </p>
          </div>
          <Badge tone={getStatusTone(interview.status)} className="capitalize">
            {interview.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          {interview.interviewerName && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {interview.interviewerName}
            </span>
          )}
          <span className="bg-hover px-2 py-0.5 rounded capitalize">
            {interview.interviewType.replace("_", " ")}
          </span>
        </div>

        {interview.notes && (
          <p className="text-sm text-secondary line-clamp-2 mt-2">{interview.notes}</p>
        )}

        {interview.feedback && (
          <div className="mt-2 p-2.5 bg-hover/60 rounded-lg border border-border text-xs text-secondary">
            <span className="font-semibold block text-primary mb-0.5">Post-Interview Feedback:</span>
            {interview.feedback}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {interview.locationOrLink && (
            <a
              href={interview.locationOrLink.startsWith("http") ? interview.locationOrLink : "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Join Link <LinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onStatusChange && interview.status === "scheduled" && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs flex items-center gap-1"
              onClick={() => onStatusChange(interview.id, "completed")}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Done
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(interview)}>
            <Edit3 className="w-4 h-4 text-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-danger hover:text-danger/80"
            onClick={() => onDelete(interview.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
