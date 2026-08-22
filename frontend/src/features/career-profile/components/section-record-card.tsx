import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionFieldConfig, SectionRecord, SectionRecordCardProps } from "@/features/career-profile/types/section";
import { displayChoiceLabel } from "@/features/career-profile/utils/section-choice";

export function SectionRecordCard<TRecord extends SectionRecord>({
  record,
  config,
  onEdit,
  onDelete,
}: SectionRecordCardProps<TRecord>) {
  const title = formatValue(record[config.card.titleField]);
  const subtitle = config.card.subtitleField ? formatValue(record[config.card.subtitleField]) : "";
  const description = config.card.descriptionField ? formatValue(record[config.card.descriptionField]) : "";
  const metaFields = config.card.metaFields ?? [];
  const statusValue = config.card.statusField ? Boolean(record[config.card.statusField]) : false;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div>
              <h4 className="text-base font-semibold text-primary">{title || config.singularLabel}</h4>
              {subtitle ? <p className="text-sm text-secondary">{subtitle}</p> : null}
            </div>
            {description ? <p className="text-sm leading-6 text-secondary">{description}</p> : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(record)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(record)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {metaFields.length > 0 || config.card.statusField ? (
          <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {metaFields.map((fieldName) => {
              const fieldConfig = config.fields.find((field) => field.name === fieldName);
              const value = formatValue(record[fieldName], fieldConfig) || "Not provided";

              return <Meta key={fieldName} label={fieldLabel(fieldName)} value={value} muted={!formatValue(record[fieldName], fieldConfig)} />;
            })}
            {config.card.statusField && statusValue ? (
              <Meta label={config.card.statusLabel ?? "Status"} value="Yes" />
            ) : null}
            {config.card.statusField && !statusValue ? (
              <Meta label={config.card.statusLabel ?? "Status"} value="No" muted />
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Meta({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      {value === "Yes" || value === "No" ? (
        <Badge tone={value === "Yes" ? "success" : "neutral"}>{value}</Badge>
      ) : (
        <p className={muted ? "text-sm text-secondary" : "text-sm text-primary"}>{value}</p>
      )}
    </div>
  );
}

function formatValue(value: unknown, fieldConfig?: SectionFieldConfig) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    if (!value.trim()) {
      return "";
    }

    const choiceLabel = displayChoiceLabel(value, fieldConfig?.options);
    if (choiceLabel && choiceLabel !== value) {
      return choiceLabel;
    }

    if (isIsoDate(value)) {
      return formatDate(value);
    }

    return value;
  }

  return "";
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function fieldLabel(fieldName: string) {
  return fieldName
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
