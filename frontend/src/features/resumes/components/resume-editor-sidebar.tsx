import { ChevronRight, Eye, EyeOff, FileText, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/class-name";
import { RESUME_EDITOR_SECTIONS } from "@/features/resumes/data/resume-editor-sections";
import type { ResumeEditorSection, ResumeEditorSectionType } from "@/features/resumes/types/resume-editor";

interface ResumeEditorSidebarProps {
  sections: ResumeEditorSection[];
  selectedSectionType: ResumeEditorSectionType;
  onSelectSectionType: (sectionType: ResumeEditorSectionType) => void;
}

export function ResumeEditorSidebar({
  sections,
  selectedSectionType,
  onSelectSectionType,
}: ResumeEditorSidebarProps) {
  return (
    <Card className="h-full overflow-hidden border-border/60 bg-surface/30 shadow-md">
      <CardContent className="space-y-4 p-3">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Sections</p>
            <p className="text-[10px] text-secondary">Navigate and arrange</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-hover border border-border/40 px-2 py-0.5 text-[10px] font-bold text-secondary">
            {sections.length} saved
          </span>
        </div>

        <div className="space-y-1.5">
          {RESUME_EDITOR_SECTIONS.map((definition) => {
            const existingSection = sections.find((section) => section.section_type === definition.type);
            const selected = selectedSectionType === definition.type;

            return (
              <button
                key={definition.type}
                type="button"
                onClick={() => onSelectSectionType(definition.type)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all duration-200 focus:outline-none",
                  selected
                    ? "border-brand-500/30 bg-brand-600/10 shadow-sm ring-1 ring-brand-500/15"
                    : "border-border/50 bg-background/30 hover:border-borderHover hover:bg-hover/40"
                )}
                aria-pressed={selected}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                    selected ? "bg-brand-600 text-white" : "bg-hover text-secondary"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-primary">{definition.label}</p>
                    <div className="flex items-center gap-1.5">
                      {selected ? (
                        <span className="rounded bg-brand-500/10 border border-brand-500/20 px-1 py-0.2 text-[9px] font-bold text-brand-400">
                          Selected
                        </span>
                      ) : null}
                      {existingSection ? (
                        existingSection.is_visible ? (
                          <Eye className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 shrink-0 text-warning" />
                        )
                      ) : (
                        <Plus className="h-3.5 w-3.5 shrink-0 text-secondary/60" />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-normal text-secondary">{definition.description}</p>
                </div>
                <ChevronRight className={cn("mt-1 h-3.5 w-3.5 shrink-0 transition-colors", selected ? "text-brand-500" : "text-muted/50")} />
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-dashed border-border/80 bg-background/30 px-3 py-2.5 text-[10px] leading-relaxed text-secondary">
          Section records are linked to your Career Profile. Show, hide, reorder, or remove items in real-time.
        </div>
      </CardContent>
    </Card>
  );
}
