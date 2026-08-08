import { ArrowRight, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { APP_ROUTES } from "@/constants/routes";
import type { Resume, ResumeStatus } from "@/features/resumes/types/resume";

interface ResumeCardProps {
  resume: Resume;
  onOpen: (resume: Resume) => void;
  onRename: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  onDuplicate: (resume: Resume) => void;
}

export function ResumeCard({ resume, onOpen, onRename, onDelete, onDuplicate }: ResumeCardProps) {
  const editorHref = APP_ROUTES.resumeEditorDetail.replace(":resumeId", resume.id);

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <h3 className="truncate text-base font-semibold text-primary">{resume.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge tone={statusTone(resume.status)}>{statusLabel(resume.status)}</Badge>
              <Badge tone="neutral">Template: {resume.template || "Not set"}</Badge>
            </div>
          </div>

          <Dropdown triggerLabel="Actions" align="right">
            <DropdownItem className="gap-2" onClick={() => onOpen(resume)}>
              <ArrowRight className="h-4 w-4" />
              Open
            </DropdownItem>
            <DropdownItem className="gap-2" onClick={() => onRename(resume)}>
              <PencilLine className="h-4 w-4" />
              Rename
            </DropdownItem>
            <DropdownItem
              className="gap-2 cursor-not-allowed opacity-50"
              disabled
              title="TODO: Enable once duplicate API exists."
              onClick={() => onDuplicate(resume)}
            >
              <MoreHorizontal className="h-4 w-4" />
              Duplicate
            </DropdownItem>
            <DropdownItem className="gap-2 text-danger" destructive onClick={() => onDelete(resume)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownItem>
          </Dropdown>
        </div>

        <div className="space-y-2 text-sm text-secondary">
          <p className="leading-6">
            Last updated{" "}
            <span className="font-medium text-primary">{formatResumeDate(resume.updated_at)}</span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <p className="text-xs text-secondary">Open the editor to manage sections and source data.</p>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="shrink-0"
        >
          <Link to={editorHref} className="inline-flex items-center gap-2">
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function formatResumeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status: ResumeStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: ResumeStatus): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "draft":
      return "neutral";
    case "in_review":
      return "warning";
    case "approved":
      return "success";
    case "applied":
      return "info";
    case "archived":
      return "danger";
    default:
      return "neutral";
  }
}
