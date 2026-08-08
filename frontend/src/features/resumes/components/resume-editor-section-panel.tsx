import { useState, useMemo, type ReactNode } from "react";
import { Eye, EyeOff, PencilLine, Plus, RotateCcw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/cards/section-card";
import { getResumeEditorSectionDefinition } from "@/features/resumes/data/resume-editor-sections";
import type {
  ResumeEditorSection,
  ResumeEditorSectionItem,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";
import { cn } from "@/lib/class-name";

import { ResumeEditorRecordCard } from "./resume-editor-record-card";

interface ResumeEditorSectionPanelProps {
  sectionType: ResumeEditorSectionType;
  activeSection: ResumeEditorSection | null;
  sourceRecords: ResumeEditorSourceRecord[];
  sectionItems: ResumeEditorSectionItem[];
  sourceRecordsLoading: boolean;
  sourceRecordsError: boolean;
  onRetrySourceRecords: () => void;
  onCreateSection: () => void;
  onRenameSection: () => void;
  onToggleVisibility: () => void;
  onToggleInclude: (record: ResumeEditorSourceRecord, includedItem: ResumeEditorSectionItem | null) => void;
  onMoveItem: (itemId: string, direction: "up" | "down") => void;
}

export function ResumeEditorSectionPanel({
  sectionType,
  activeSection,
  sourceRecords,
  sectionItems,
  sourceRecordsLoading,
  sourceRecordsError,
  onRetrySourceRecords,
  onCreateSection,
  onRenameSection,
  onToggleVisibility,
  onToggleInclude,
  onMoveItem,
}: ResumeEditorSectionPanelProps) {
  const sectionDefinition = getResumeEditorSectionDefinition(sectionType);
  const sectionTitle = activeSection?.title ?? sectionDefinition?.label ?? "Section";
  const includedCount = sectionItems.length;
  const includedItemMap = new Map(sectionItems.map((item) => [item.source_object_id, item]));
  const includedRecords = sourceRecords.filter((record) => includedItemMap.has(record.id));
  const excludedRecords = sourceRecords.filter((record) => !includedItemMap.has(record.id));

  const [searchQuery, setSearchQuery] = useState("");

  const filteredExcludedRecords = useMemo(() => {
    if (!searchQuery.trim()) return excludedRecords;
    const query = searchQuery.toLowerCase();
    return excludedRecords.filter((record) =>
      record.searchText.includes(query) ||
      record.title.toLowerCase().includes(query) ||
      (record.subtitle && record.subtitle.toLowerCase().includes(query)) ||
      (record.description && record.description.toLowerCase().includes(query))
    );
  }, [excludedRecords, searchQuery]);

  return (
    <SectionCard
      title={sectionDefinition?.label ?? "Resume Section"}
      description={sectionDefinition?.description ?? ""}
      className="h-full"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/80 bg-surface/40 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-bold tracking-tight text-primary">{sectionTitle}</h3>
                {activeSection ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
                      activeSection.is_visible
                        ? "bg-success/15 border-success/20 text-success"
                        : "bg-warning/15 border-warning/20 text-warning"
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", activeSection.is_visible ? "bg-success" : "bg-warning")}
                    />
                    {activeSection.is_visible ? "Visible in resume" : "Hidden"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-hover border border-border/50 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary/60" />
                    Not created yet
                  </span>
                )}
              </div>
              <p className="max-w-2xl text-xs leading-5 text-secondary">
                {activeSection
                  ? "Include real Career Profile records, reorder them, and keep the section visibility aligned with the final resume."
                  : "Create the section first, then include Career Profile records and order them with the Up and Down controls."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!activeSection ? (
                <Button type="button" size="sm" onClick={onCreateSection}>
                  <Plus className="h-3.5 w-3.5" />
                  Create section
                </Button>
              ) : (
                <>
                  <Button type="button" size="sm" variant="secondary" onClick={onRenameSection}>
                    <PencilLine className="h-3.5 w-3.5" />
                    Rename
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={onToggleVisibility}>
                    {activeSection.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {activeSection.is_visible ? "Hide section" : "Show section"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <Card className="border-border/60 bg-background/30 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {!activeSection && !sourceRecordsLoading && !sourceRecordsError ? (
              <div className="p-6">
                <EmptyState
                  title="This section has not been added yet"
                  description="Create the section first, then include Career Profile records and order them with the Up and Down buttons."
                  actionLabel={`Create ${sectionDefinition?.label ?? "section"}`}
                  onAction={onCreateSection}
                  icon={<Plus className="h-6 w-6 text-muted" />}
                  className="min-h-[260px]"
                />
              </div>
            ) : null}

            {sourceRecordsLoading ? (
              <div className="p-6">
                <LoadingState label={`Loading ${sectionDefinition?.label.toLowerCase() ?? "records"}...`} />
              </div>
            ) : sourceRecordsError ? (
              <div className="p-6">
                <ErrorState
                  description="We could not load the source records for this section right now."
                  onRetry={onRetrySourceRecords}
                />
              </div>
            ) : activeSection ? (
              <div className="space-y-8 p-6">
                {/* 1. Included Records Stack */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold tracking-wider uppercase text-primary">Included Records</h4>
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                        {includedRecords.length}
                      </span>
                    </div>
                  </div>

                  <RecordColumn
                    title="Included in section"
                    count={includedRecords.length}
                    emptyTitle="No records included yet"
                    emptyDescription="Browse available Career Profile records below and click 'Include' to add them to this section."
                    emptyIcon={<Plus className="h-6 w-6 text-muted" />}
                  >
                    {includedRecords.length > 0 ? (
                      <div className="space-y-3">
                        {includedRecords
                          .slice()
                          .sort(
                            (left, right) =>
                              (includedItemMap.get(left.id)?.display_order ?? 0) -
                              (includedItemMap.get(right.id)?.display_order ?? 0)
                          )
                          .map((record, index, list) => {
                            const includedItem = includedItemMap.get(record.id) ?? null;
                            return (
                              <ResumeEditorRecordCard
                                key={record.id}
                                record={record}
                                sectionType={sectionType}
                                includedItem={includedItem}
                                canEdit={Boolean(activeSection)}
                                orderNumber={index + 1}
                                canMoveUp={index > 0}
                                canMoveDown={index < list.length - 1}
                                onToggleInclude={onToggleInclude}
                                onMoveUp={(itemId) => onMoveItem(itemId, "up")}
                                onMoveDown={(itemId) => onMoveItem(itemId, "down")}
                              />
                            );
                          })}
                      </div>
                    ) : null}
                  </RecordColumn>
                </div>

                {/* 2. Available Records Stack */}
                <div className="space-y-4 pt-4 border-t border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold tracking-wider uppercase text-primary">Available from Career Profile</h4>
                      <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold text-brand-400">
                        {excludedRecords.length}
                      </span>
                    </div>

                    {/* Search Field */}
                    {excludedRecords.length > 0 ? (
                      <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          placeholder="Search profile records..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-primary shadow-sm transition-colors placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    ) : null}
                  </div>

                  <RecordColumn
                    title="Available from Career Profile"
                    count={filteredExcludedRecords.length}
                    emptyTitle={searchQuery ? "No matching records found" : "All records are included"}
                    emptyDescription={
                      searchQuery
                        ? "Try adjusting your search terms to find other profile records."
                        : "All records from your Career Profile are currently active in this resume section."
                    }
                    emptyIcon={searchQuery ? <Search className="h-6 w-6 text-muted" /> : <RotateCcw className="h-6 w-6 text-muted" />}
                  >
                    {filteredExcludedRecords.length > 0 ? (
                      <div className="space-y-3">
                        {filteredExcludedRecords.map((record) => (
                          <ResumeEditorRecordCard
                            key={record.id}
                            record={record}
                            sectionType={sectionType}
                            includedItem={null}
                            canEdit={Boolean(activeSection)}
                            onToggleInclude={onToggleInclude}
                          />
                        ))}
                      </div>
                    ) : null}
                  </RecordColumn>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </SectionCard>
  );
}

function RecordColumn({
  emptyTitle,
  emptyDescription,
  emptyIcon,
  count,
  children,
}: {
  title: string;
  count: number;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
  children: ReactNode;
}) {
  const hasItems = Boolean(count);

  return (
    <div className="space-y-4">
      {hasItems ? (
        children
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          className="min-h-[280px]"
        />
      )}
    </div>
  );
}
