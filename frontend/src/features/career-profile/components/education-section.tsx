import { useState } from "react";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useEducations } from "@/features/career-profile/hooks/use-educations";
import type {
  Education,
  EducationFormValues,
} from "@/features/career-profile/types/education";
import { EducationCard } from "@/features/career-profile/components/education-card";
import { EducationFormDialog } from "@/features/career-profile/components/education-form-dialog";

interface EducationSectionProps {
  canManageEducation: boolean;
}

export function EducationSection({ canManageEducation }: EducationSectionProps) {
  const { educationQuery, createEducation, updateEducation, deleteEducation, isDeletingEducation } =
    useEducations();
  const [editorEducation, setEditorEducation] = useState<Education | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);

  const educations = educationQuery.data ?? [];
  const hasEducations = educations.length > 0;

  const openCreateDialog = () => {
    setEditorEducation(null);
    setIsEditorOpen(true);
  };

  const openEditDialog = (education: Education) => {
    setEditorEducation(education);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorEducation(null);
  };

  const handleSave = async (values: EducationFormValues) => {
    if (editorEducation) {
      await updateEducation({ educationId: editorEducation.id, payload: values });
      return;
    }

    await createEducation(values);
  };

  const handleDelete = async () => {
    if (!deleteTarget || isDeletingEducation) {
      return;
    }

    await deleteEducation(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (educationQuery.isError) {
    return (
      <ErrorState
        description="We could not load the education records right now. Please try again in a moment."
        onRetry={() => {
          void educationQuery.refetch();
        }}
      />
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 border-b border-border px-6 py-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-primary">Education</h3>
            <p className="max-w-2xl text-sm leading-6 text-secondary">
              Keep your education history in one structured place for resumes, applications, and future
              profile modules.
            </p>
          </div>
          <Button type="button" disabled={!canManageEducation} onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add Education
          </Button>
        </div>

        <CardContent className="space-y-4">
          {educationQuery.isLoading ? (
            <div className="rounded-xl border border-border bg-hover/30 px-4 py-5 text-sm text-secondary">
              Loading education records...
            </div>
          ) : hasEducations ? (
            <div className="space-y-4">
              {educations.map((education) => (
                <EducationCard
                  key={education.id}
                  education={education}
                  onDelete={setDeleteTarget}
                  onEdit={openEditDialog}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No education records yet"
              description={
                canManageEducation
                  ? "Add your first education entry to give the profile more depth."
                  : "Create your career profile first, then add education records."
              }
              actionLabel={canManageEducation ? "Add Education" : undefined}
              onAction={canManageEducation ? openCreateDialog : undefined}
              icon={<Badge tone="neutral">0</Badge>}
            />
          )}
        </CardContent>
      </Card>

      <EducationFormDialog
        education={editorEducation}
        onClose={closeEditor}
        onSubmit={handleSave}
        open={isEditorOpen}
      />

      <ConfirmationDialog
        cancelLabel="Cancel"
        confirmLabel={isDeletingEducation ? "Deleting..." : "Delete education"}
        description={
          deleteTarget
            ? `Delete ${deleteTarget.institution}? This action cannot be undone.`
            : "Delete this education record? This action cannot be undone."
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
        open={deleteTarget !== null}
        title="Delete education?"
      />
    </>
  );
}
