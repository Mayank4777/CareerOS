import { useMemo, useState } from "react";
import { FileText, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/cards/section-card";
import { useToast } from "@/components/ui/toast";
import { APP_ROUTES } from "@/constants/routes";
import { deleteResume, fetchResumes, updateResume, createResume } from "@/features/resumes/services/resumes";
import { useGenerateResume } from "@/features/resumes/hooks/use-resumes";
import { ResumeGenerateDialog } from "@/features/resumes/components/resume-generate-dialog";
import { ResumeCard } from "@/features/resumes/components/resume-card";
import { ResumeDialog } from "@/features/resumes/components/resume-dialog";
import type { Resume, ResumeFormValues, ResumeGeneratePayload, ResumeRenameFormValues } from "@/features/resumes/types/resume";

type ResumeSortOption = "recent" | "oldest" | "title-asc" | "title-desc" | "status" | "template";

export function ResumeDashboardPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<ResumeSortOption>("recent");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const generateMutation = useGenerateResume();

  const handleGenerateResume = async (payload: ResumeGeneratePayload) => {
    try {
      const generated = await generateMutation.mutateAsync(payload);
      toast.success("Resume Generated", `"${generated.title}" created from your Career Profile.`);
      navigate(APP_ROUTES.resumeEditorDetail.replace(":resumeId", generated.id));
    } catch (err: any) {
      toast.error("Generation Failed", err.message || "Could not generate resume.");
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({
      resumeId,
      payload,
    }: {
      resumeId: string;
      payload: ResumeFormValues | ResumeRenameFormValues;
    }) => updateResume(resumeId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume updated", "Your changes were saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted", "The resume was removed from your library.");
    },
  });

  const resumes = useMemo(() => resumesQuery.data ?? [], [resumesQuery.data]);
  const visibleResumes = useMemo(
    () => sortResumes(filterResumes(resumes, searchTerm), sortBy),
    [resumes, searchTerm, sortBy]
  );
  const hasSearch = searchTerm.trim().length > 0;

  if (resumesQuery.isLoading) {
    return <LoadingState label="Loading resumes..." />;
  }

  if (resumesQuery.isError) {
    return (
      <ErrorState
        description="We could not load your resumes right now. Please try again in a moment."
        onRetry={() => {
          void resumesQuery.refetch();
        }}
      />
    );
  }

  const handleRenameResume = async (values: ResumeFormValues | ResumeRenameFormValues) => {
    if (!editingResume) {
      return;
    }

    await updateMutation.mutateAsync({
      resumeId: editingResume.id,
      payload: {
        title: values.title,
      },
    });
  };

  const handleDeleteResume = async () => {
    if (!deleteTarget || deleteMutation.isPending) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const openEditor = (resume: Resume) => {
    navigate(APP_ROUTES.resumeEditorDetail.replace(":resumeId", resume.id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Dashboard"
        description="Intelligent career resume composition, version control, and ATS optimization."
        breadcrumbs={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Resume" },
        ]}
        actions={
          <Button type="button" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Resume
          </Button>
        }
      />


      <SectionCard
        title="Your resumes"
        description="Search, sort, and manage the resume library."
      >
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <FormField htmlFor="resume-search" label="Search">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                      id="resume-search"
                      className="pl-9"
                      placeholder="Search by title, template, or status"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </FormField>

                <FormField htmlFor="resume-sort" label="Sort by">
                  <select
                    id="resume-sort"
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm transition-colors duration-normal focus:border-borderFocus focus:outline-none focus:ring-2 focus:ring-borderFocus/20"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as ResumeSortOption)}
                  >
                    <option value="recent">Last updated: newest</option>
                    <option value="oldest">Last updated: oldest</option>
                    <option value="title-asc">Title: A to Z</option>
                    <option value="title-desc">Title: Z to A</option>
                    <option value="status">Status</option>
                    <option value="template">Template</option>
                  </select>
                </FormField>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-secondary">
                <Badge tone="neutral">{visibleResumes.length} resumes</Badge>
                {hasSearch ? <Badge tone="info">Filtered by search</Badge> : null}
              </div>
            </CardContent>
          </Card>

          {visibleResumes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onOpen={openEditor}
                  onRename={setEditingResume}
                  onDelete={setDeleteTarget}
                  onDuplicate={(_resume) => {
                    // TODO: Enable once duplicate API exists.
                  }}
                />
              ))}
            </div>
          ) : hasSearch ? (
            <EmptyState
              title="No resumes match your search"
              description="Try a different title, template, or status filter."
              actionLabel="Clear search"
              onAction={() => setSearchTerm("")}
              icon={<SlidersHorizontal className="h-6 w-6" />}
            />
          ) : (
            <EmptyState
              title="No resumes yet"
              description="Create your first resume to start organizing templates and editor sections."
              actionLabel="Create resume"
              onAction={() => setIsCreateOpen(true)}
              icon={<FileText className="h-6 w-6" />}
            />
          )}
        </div>
      </SectionCard>

      <ResumeGenerateDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleGenerateResume}
        isLoading={generateMutation.isPending}
      />

      <ResumeDialog
        open={editingResume !== null}
        mode="rename"
        resume={editingResume}
        onClose={() => setEditingResume(null)}
        onSubmit={handleRenameResume}
      />

      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Delete resume?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}"? This action cannot be undone.`
            : "Delete this resume? This action cannot be undone."
        }
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete resume"}
        cancelLabel="Cancel"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteResume();
        }}
      />
    </div>
  );
}

function filterResumes(resumes: Resume[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return resumes;
  }

  return resumes.filter((resume) => {
    const fields = [resume.title, resume.template, resume.status];
    return fields.some((value) => value.toLowerCase().includes(normalizedSearch));
  });
}

function sortResumes(resumes: Resume[], sortBy: ResumeSortOption) {
  const items = [...resumes];

  const statusRank: Record<Resume["status"], number> = {
    draft: 0,
    in_review: 1,
    approved: 2,
    applied: 3,
    archived: 4,
  };

  items.sort((left, right) => {
    switch (sortBy) {
      case "oldest":
        return dateValue(left.updated_at) - dateValue(right.updated_at);
      case "title-asc":
        return left.title.localeCompare(right.title);
      case "title-desc":
        return right.title.localeCompare(left.title);
      case "status":
        return statusRank[left.status] - statusRank[right.status] || left.title.localeCompare(right.title);
      case "template":
        return left.template.localeCompare(right.template) || left.title.localeCompare(right.title);
      case "recent":
      default:
        return dateValue(right.updated_at) - dateValue(left.updated_at);
    }
  });

  return items;
}

function dateValue(value: string) {
  return new Date(value).getTime();
}
