import { useState } from "react";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/cards/section-card";
import { APP_ROUTES } from "@/constants/routes";
import { fetchCareerProfile } from "@/features/career-profile/services/career-profile";
import { useSectionResource } from "@/features/career-profile/hooks/use-section-resource";
import { SectionRecordCard } from "@/features/career-profile/components/section-record-card";
import { SectionResourceDialog } from "@/features/career-profile/components/section-resource-dialog";
import type {
  SectionFieldConfig,
  SectionModulePageProps,
  SectionRecord,
} from "@/features/career-profile/types/section";
import { normalizeChoiceValue } from "@/features/career-profile/utils/section-choice";
import { useQuery } from "@tanstack/react-query";

export function SectionResourcePage<TRecord extends SectionRecord>({
  config,
  topContent,
}: SectionModulePageProps) {
  const [editorRecord, setEditorRecord] = useState<TRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TRecord | null>(null);

  const profileQuery = useQuery({
    queryKey: ["career-profile"],
    queryFn: fetchCareerProfile,
  });

  const {
    recordQuery,
    createRecord,
    updateRecord,
    deleteRecord,
    isDeletingRecord,
  } = useSectionResource<TRecord>(config);

  const records = (recordQuery.data ?? []) as TRecord[];
  const hasRecords = records.length > 0;
  const canManage = Boolean(profileQuery.data);

  const openCreateDialog = () => {
    setEditorRecord(null);
    setIsEditorOpen(true);
  };

  const openEditDialog = (record: TRecord) => {
    setEditorRecord(record);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorRecord(null);
  };

  const handleSave = async (values: Record<string, unknown>) => {
    const duplicateRecord = findDuplicateRecord(
      records,
      values,
      config.uniqueFields ?? [config.card.titleField],
      editorRecord,
      config.fields
    );

    if (duplicateRecord) {
      throw new Error(`${config.singularLabel} already exists.`);
    }

    if (editorRecord) {
      await updateRecord({ recordId: editorRecord.id, payload: values });
      return;
    }

    await createRecord(values);
  };

  const handleDelete = async () => {
    if (!deleteTarget || isDeletingRecord) {
      return;
    }

    await deleteRecord(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (profileQuery.isLoading) {
    return <LoadingState label={`Loading ${config.title.toLowerCase()}...`} />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        description={`We could not load your ${config.title.toLowerCase()} right now. Please try again in a moment.`}
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Career Profile", href: APP_ROUTES.careerProfile },
          { label: config.title },
        ]}
        title={config.title}
        description={config.description}
        actions={
          <Button type="button" disabled={!canManage} onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add {config.singularLabel}
          </Button>
        }
      />

      {topContent}

      <SectionCard
        title={config.title}
        description={canManage ? config.emptyStateDescription.withProfile : config.emptyStateDescription.withoutProfile}
      >
        <Card>
          <CardContent className="space-y-4">
            {recordQuery.isError ? (
              <ErrorState
                description={`We could not load your ${config.title.toLowerCase()} records right now. Please try again in a moment.`}
                onRetry={() => {
                  void recordQuery.refetch();
                }}
              />
            ) : recordQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : hasRecords ? (
              <div className="space-y-4">
                {records.map((record) => (
                  <SectionRecordCard
                    key={record.id}
                    record={record}
                    config={config}
                    onDelete={setDeleteTarget}
                    onEdit={openEditDialog}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={config.emptyStateTitle}
                description={
                  canManage ? config.emptyStateDescription.withProfile : config.emptyStateDescription.withoutProfile
                }
                actionLabel={canManage ? `Add ${config.singularLabel}` : undefined}
                onAction={canManage ? openCreateDialog : undefined}
                icon={<Badge tone="neutral">0</Badge>}
              />
            )}
          </CardContent>
        </Card>
      </SectionCard>

      <SectionResourceDialog
        config={config}
        record={editorRecord}
        onClose={closeEditor}
        onSubmit={handleSave}
        open={isEditorOpen}
      />

      <ConfirmationDialog
        cancelLabel="Cancel"
        confirmLabel={isDeletingRecord ? "Deleting..." : `Delete ${config.singularLabel.toLowerCase()}`}
        description={
          deleteTarget
            ? `Delete this ${config.singularLabel.toLowerCase()}? This action cannot be undone.`
            : `Delete this ${config.singularLabel.toLowerCase()}? This action cannot be undone.`
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
        open={deleteTarget !== null}
        title={`Delete ${config.singularLabel.toLowerCase()}?`}
      />
    </div>
  );
}

function findDuplicateRecord(
  records: SectionRecord[],
  values: Record<string, unknown>,
  uniqueFields: string[],
  editorRecord: SectionRecord | null,
  fieldConfigs: SectionFieldConfig[]
) {
  if (uniqueFields.length === 0) {
    return null;
  }

  const normalizedValues = uniqueFields.map((field) => normalizeComparisonValue(values[field], fieldConfigs, field));

  return (
    records.find((record) => {
      if (editorRecord && record.id === editorRecord.id) {
        return false;
      }

      return uniqueFields.every((field, index) => {
        return normalizeComparisonValue(record[field], fieldConfigs, field) === normalizedValues[index];
      });
    }) ?? null
  );
}

function normalizeComparisonValue(
  value: unknown,
  fieldConfigs: SectionFieldConfig[],
  fieldName: string
) {
  const field = fieldConfigs.find((item) => item.name === fieldName);

  if (field?.kind === "combobox") {
    return normalizeChoiceValue(value, field.options, Boolean(field.allowCustom)).trim().toLowerCase();
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}
