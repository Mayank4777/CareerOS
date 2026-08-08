import { useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { APP_ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/toast";
import { fetchResume, updateResume } from "@/features/resumes/services/resumes";
import { getResumeEditorSectionDefinition, RESUME_EDITOR_SECTIONS } from "@/features/resumes/data/resume-editor-sections";
import type {
  ResumeEditorSection,
  ResumeEditorSectionFormValues,
  ResumeEditorSectionItem,
  ResumeEditorSectionItemFormValues,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";
import {
  createResumeEditorSection,
  createResumeEditorSectionItem,
  deleteResumeEditorSectionItem,
  fetchResumeEditorSectionItems,
  fetchResumeEditorSections,
  fetchResumeEditorSourceRecords,
  updateResumeEditorSection,
  updateResumeEditorSectionItem,
} from "@/features/resumes/services/resume-editor";

import { ResumeEditorSidebar } from "@/features/resumes/components/resume-editor-sidebar";
import { ResumeEditorSectionDialog } from "@/features/resumes/components/resume-editor-section-dialog";
import { ResumeEditorPreview } from "@/features/resumes/components/resume-editor-preview";
import { ResumeEditorSectionPanel } from "@/features/resumes/components/resume-editor-section-panel";

type SectionDialogMode = "create" | "rename" | null;
type MoveDirection = "up" | "down";

export function ResumeEditorPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedSectionType, setSelectedSectionType] =
    useState<ResumeEditorSectionType>("personal_information");
  const [sectionDialogMode, setSectionDialogMode] = useState<SectionDialogMode>(null);

  const resumeQuery = useQuery({
    queryKey: ["resumes", resumeId],
    queryFn: () => {
      if (!resumeId) {
        throw new Error("Resume id is missing.");
      }
      return fetchResume(resumeId);
    },
    enabled: Boolean(resumeId),
  });

  const sectionsQuery = useQuery({
    queryKey: ["resume-editor", resumeId, "sections"],
    queryFn: () => {
      if (!resumeId) {
        throw new Error("Resume id is missing.");
      }
      return fetchResumeEditorSections(resumeId);
    },
    enabled: Boolean(resumeId),
  });

  const activeSectionDefinition = useMemo(
    () => getResumeEditorSectionDefinition(selectedSectionType),
    [selectedSectionType]
  );

  const activeSection = useMemo(
    () => sectionsQuery.data?.find((section) => section.section_type === selectedSectionType) ?? null,
    [sectionsQuery.data, selectedSectionType]
  );

  const sourceRecordsQuery = useQuery({
    queryKey: ["resume-editor", resumeId, "sources", selectedSectionType],
    queryFn: () => fetchResumeEditorSourceRecords(selectedSectionType),
    enabled: Boolean(resumeId),
  });

  const sectionItemsQuery = useQuery({
    queryKey: ["resume-editor", activeSection?.id, "items"],
    queryFn: () => {
      if (!activeSection) {
        throw new Error("Section is missing.");
      }
      return fetchResumeEditorSectionItems(activeSection.id);
    },
    enabled: Boolean(activeSection),
  });

  const sectionItems = useMemo(
    () => (sectionItemsQuery.data ?? []).slice().sort((left, right) => left.display_order - right.display_order),
    [sectionItemsQuery.data]
  );

  const createSectionMutation = useMutation({
    mutationFn: async (values: ResumeEditorSectionFormValues & { sectionType: ResumeEditorSectionType }) => {
      if (!resumeId) {
        throw new Error("Resume id is missing.");
      }

      return createResumeEditorSection(resumeId, {
        sectionType: values.sectionType,
        title: values.title,
        isVisible: values.isVisible,
        displayOrder: getNextSectionOrder(sectionsQuery.data ?? []),
      });
    },
    onSuccess: async (section) => {
      await queryClient.invalidateQueries({ queryKey: ["resume-editor", resumeId, "sections"] });
      setSelectedSectionType(section.section_type);
      setSectionDialogMode(null);
      toast.success("Section created", "The section is ready for records.");
    },
    onError: (error) => {
      toast.error("Could not create section", getErrorMessage(error, "Please try again."));
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({
      sectionId,
      payload,
    }: {
      sectionId: string;
      payload: Partial<ResumeEditorSectionFormValues> & { displayOrder?: number };
    }) => updateResumeEditorSection(sectionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resume-editor", resumeId, "sections"] });
      toast.success("Section updated", "Your section changes were saved.");
    },
    onError: (error) => {
      toast.error("Could not save section", getErrorMessage(error, "Please try again."));
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (payload: ResumeEditorSectionItemFormValues) => {
      if (!activeSection) {
        throw new Error("Section is missing.");
      }
      return createResumeEditorSectionItem(activeSection.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resume-editor", activeSection?.id, "items"] });
      toast.success("Record included", "The record was added to the resume section.");
    },
    onError: (error) => {
      toast.error("Could not include record", getErrorMessage(error, "Please try again."));
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteResumeEditorSectionItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resume-editor", activeSection?.id, "items"] });
      toast.success("Record removed", "The record was removed from the section.");
    },
    onError: (error) => {
      toast.error("Could not remove record", getErrorMessage(error, "Please try again."));
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, direction }: { itemId: string; direction: MoveDirection }) => {
      const currentIndex = sectionItems.findIndex((item) => item.id === itemId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sectionItems.length) {
        return;
      }

      const currentItem = sectionItems[currentIndex];
      const targetItem = sectionItems[targetIndex];

      await Promise.all([
        updateResumeEditorSectionItem(currentItem.id, { displayOrder: targetItem.display_order }),
        updateResumeEditorSectionItem(targetItem.id, { displayOrder: currentItem.display_order }),
      ]);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resume-editor", activeSection?.id, "items"] });
      toast.success("Order updated", "The section order was saved.");
    },
    onError: (error) => {
      toast.error("Could not update order", getErrorMessage(error, "Please try again."));
    },
  });

  const updateResumeMutation = useMutation({
    mutationFn: async (payload: { template: string }) => {
      if (!resumeId) {
        throw new Error("Resume id is missing.");
      }
      if (!resumeQuery.data) {
        throw new Error("Resume details are not loaded.");
      }
      return updateResume(resumeId, {
        title: resumeQuery.data.title,
        status: resumeQuery.data.status,
        template: payload.template,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
      toast.success("Template changed", "Successfully switched resume template.");
    },
    onError: (error) => {
      toast.error("Could not switch template", getErrorMessage(error, "Please try again."));
    },
  });

  const sourceRecordsQueries = useQueries({
    queries: RESUME_EDITOR_SECTIONS.map((def) => ({
      queryKey: ["resume-editor", resumeId, "sources", def.type],
      queryFn: () => fetchResumeEditorSourceRecords(def.type),
      enabled: Boolean(resumeId),
    })),
  });

  const sections = sectionsQuery.data ?? [];
  const sectionItemsQueries = useQueries({
    queries: sections.map((section) => ({
      queryKey: ["resume-editor", section.id, "items"],
      queryFn: () => fetchResumeEditorSectionItems(section.id),
      enabled: Boolean(section.id),
    })),
  });

  const allSectionItems = useMemo(() => {
    const map: Record<string, ResumeEditorSectionItem[]> = {};
    sections.forEach((section, index) => {
      const query = sectionItemsQueries[index];
      map[section.id] = query?.data ?? [];
    });
    return map;
  }, [sections, sectionItemsQueries]);

  const allSourceRecords = useMemo(() => {
    const map: Record<ResumeEditorSectionType, ResumeEditorSourceRecord[]> = {} as Record<
      ResumeEditorSectionType,
      ResumeEditorSourceRecord[]
    >;
    RESUME_EDITOR_SECTIONS.forEach((def, index) => {
      const query = sourceRecordsQueries[index];
      map[def.type] = query?.data ?? [];
    });
    return map;
  }, [sourceRecordsQueries]);

  if (!resumeId) {
    return (
      <ErrorState
        description="The resume editor URL is missing a resume id."
        onRetry={() => {
          navigate(APP_ROUTES.resumeLibrary, { replace: true });
        }}
      />
    );
  }

  if (resumeQuery.isLoading) {
    return <LoadingState label="Loading resume editor..." />;
  }

  if (resumeQuery.isError || !resumeQuery.data) {
    return (
      <ErrorState
        description="We could not load this resume right now. Please try again."
        onRetry={() => {
          void resumeQuery.refetch();
        }}
      />
    );
  }

  if (sectionsQuery.isLoading) {
    return <LoadingState label="Loading resume sections..." />;
  }

  if (sectionsQuery.isError) {
    return (
      <ErrorState
        description="We could not load the resume sections right now. Please try again."
        onRetry={() => {
          void sectionsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={resumeQuery.data.title}
        description="Organize resume sections, link Career Profile records, and keep the preview in sync."
        breadcrumbs={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Resume", href: APP_ROUTES.resume },
          { label: "Resume Editor" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link to={APP_ROUTES.resume}>
              <ArrowLeft className="h-4 w-4" />
              Back to resumes
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[250px_1fr_500px] xl:items-start">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <ResumeEditorSidebar
            sections={sectionsQuery.data ?? []}
            selectedSectionType={selectedSectionType}
            onSelectSectionType={setSelectedSectionType}
          />
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <ResumeEditorSectionPanel
            sectionType={selectedSectionType}
            activeSection={activeSection}
            sourceRecords={sourceRecordsQuery.data ?? []}
            sectionItems={sectionItems}
            sourceRecordsLoading={sourceRecordsQuery.isLoading}
            sourceRecordsError={sourceRecordsQuery.isError}
            onRetrySourceRecords={() => {
              void sourceRecordsQuery.refetch();
            }}
            onCreateSection={() => setSectionDialogMode("create")}
            onRenameSection={() => setSectionDialogMode("rename")}
            onToggleVisibility={() => {
              if (!activeSection) {
                return;
              }

              void updateSectionMutation.mutateAsync({
                sectionId: activeSection.id,
                payload: { isVisible: !activeSection.is_visible },
              });
            }}
            onToggleInclude={(record, includedItem) => {
              if (!activeSection) {
                return;
              }

              if (includedItem) {
                void deleteItemMutation.mutateAsync(includedItem.id);
                return;
              }

              void createItemMutation.mutateAsync({
                sourceObjectId: record.id,
                displayOrder: getNextItemOrder(sectionItems),
              });
            }}
            onMoveItem={(itemId, direction) => {
              if (!activeSection) {
                return;
              }

              void moveItemMutation.mutateAsync({ itemId, direction });
            }}
          />
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <ResumeEditorPreview
            resume={resumeQuery.data}
            sections={sectionsQuery.data ?? []}
            selectedSectionType={selectedSectionType}
            selectedSection={activeSection}
            selectedItems={sectionItems}
            selectedRecords={getIncludedSourceRecords(sourceRecordsQuery.data ?? [], sectionItems)}
            allSectionItems={allSectionItems}
            allSourceRecords={allSourceRecords}
            onUpdateTemplate={(template) => {
              void updateResumeMutation.mutateAsync({ template });
            }}
          />
        </div>
      </div>

      {activeSectionDefinition ? (
        <ResumeEditorSectionDialog
          open={sectionDialogMode !== null}
          mode={sectionDialogMode === "create" ? "create" : "rename"}
          sectionType={selectedSectionType}
          section={activeSection}
          defaultTitle={activeSectionDefinition.label}
          onClose={() => setSectionDialogMode(null)}
          onSubmit={async (values) => {
            if (!activeSection) {
              await createSectionMutation.mutateAsync({
                sectionType: selectedSectionType,
                title: values.title,
                isVisible: values.isVisible,
              });
              return;
            }

            await updateSectionMutation.mutateAsync({
              sectionId: activeSection.id,
              payload: values,
            });
          }}
        />
      ) : null}
    </div>
  );
}

function getIncludedSourceRecords(sourceRecords: ResumeEditorSourceRecord[], items: ResumeEditorSectionItem[]) {
  const itemMap = new Map(items.map((item) => [item.source_object_id, item]));
  return sourceRecords
    .filter((record) => itemMap.has(record.id))
    .slice()
    .sort((left, right) => (itemMap.get(left.id)?.display_order ?? 0) - (itemMap.get(right.id)?.display_order ?? 0));
}

function getNextSectionOrder(sections: ResumeEditorSection[]) {
  return sections.reduce((max, section) => Math.max(max, section.display_order), -1) + 1;
}

function getNextItemOrder(items: ResumeEditorSectionItem[]) {
  return items.reduce((max, item) => Math.max(max, item.display_order), -1) + 1;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as { message?: string } | undefined;
    return response?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
