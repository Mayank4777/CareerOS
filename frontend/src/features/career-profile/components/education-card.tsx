import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Education } from "@/features/career-profile/types/education";

interface EducationCardProps {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}

export function EducationCard({ education, onEdit, onDelete }: EducationCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div>
              <h4 className="text-base font-semibold text-primary">{education.institution}</h4>
              <p className="text-sm text-secondary">{education.degree}</p>
            </div>
            <p className="text-sm leading-6 text-secondary">{education.fieldOfStudy}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(education)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(education)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Meta label="Dates" value={formatEducationDates(education.startDate, education.endDate)} />
          <Meta label="Grade" value={education.grade} />
        </div>
      </CardContent>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm text-primary">{value}</p>
    </div>
  );
}

function formatEducationDates(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}
