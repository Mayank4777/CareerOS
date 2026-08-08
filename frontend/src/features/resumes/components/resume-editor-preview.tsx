import { EyeOff, Layers3, Sparkles, FileText } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/cards/section-card";
import { RESUME_EDITOR_SECTIONS } from "@/features/resumes/data/resume-editor-sections";
import type { Resume } from "@/features/resumes/types/resume";
import type {
  ResumeEditorSection,
  ResumeEditorSectionItem,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";
import { cn } from "@/lib/class-name";
import { RESUME_TEMPLATES } from "@/features/resumes/templates";

interface ResumeEditorPreviewProps {
  resume: Resume;
  sections: ResumeEditorSection[];
  selectedSectionType: ResumeEditorSectionType;
  selectedSection: ResumeEditorSection | null;
  selectedItems: ResumeEditorSectionItem[];
  selectedRecords: ResumeEditorSourceRecord[];
  allSectionItems: Record<string, ResumeEditorSectionItem[]>;
  allSourceRecords: Record<ResumeEditorSectionType, ResumeEditorSourceRecord[]>;
  onUpdateTemplate: (template: string) => void;
}

export function ResumeEditorPreview({
  resume,
  sections,
  selectedSectionType,
  selectedSection,
  selectedItems,
  selectedRecords,
  allSectionItems,
  allSourceRecords,
  onUpdateTemplate,
}: ResumeEditorPreviewProps) {
  const visibleSections = sections.filter((section) => section.is_visible);
  const currentSectionDefinition = RESUME_EDITOR_SECTIONS.find((section) => section.type === selectedSectionType);

  const activeTemplateName = resume.template || "modern";
  const TemplateComponent = RESUME_TEMPLATES[activeTemplateName] || RESUME_TEMPLATES["modern"];

  return (
    <SectionCard
      title="Live Preview"
      description="A live A4-style preview of the resume as you edit sections and records."
      className="h-full"
    >
      <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border pb-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-secondary">Document Preview</p>
              <h3 className="mt-1 truncate text-lg font-semibold tracking-tight text-primary">{resume.title}</h3>
              <p className="text-xs text-secondary/80 tracking-wide mt-0.5">{resume.status.replaceAll("_", " ")}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Template:</span>
                <select
                  value={activeTemplateName}
                  onChange={(e) => onUpdateTemplate(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2 py-1 text-xs text-primary shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="modern">Modern</option>
                  <option value="professional">Professional</option>
                  <option value="minimal">Minimal</option>
                  <option value="executive">Executive</option>
                  <option value="ats">ATS Friendly</option>
                </select>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
                <FileText className="h-3.5 w-3.5 text-secondary" />
                <span className="text-xs font-semibold text-secondary">A4 Preview</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <PreviewStat label="Visible sections" value={String(visibleSections.length)} icon={<Layers3 className="h-4 w-4" />} />
            <PreviewStat label="Selected section" value={currentSectionDefinition?.label ?? "Unknown"} icon={<Sparkles className="h-4 w-4" />} />
            <PreviewStat label="Included records" value={String(selectedItems.length)} icon={<EyeOff className="h-4 w-4" />} />
          </div>

          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            <div className="mx-auto w-full max-w-[580px] py-2">
              <div className="aspect-[210/297] rounded-[12px] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_1px_rgba(0,0,0,0.2)] overflow-hidden">
                <TemplateComponent
                  resume={resume}
                  sections={sections}
                  allSectionItems={allSectionItems}
                  allSourceRecords={allSourceRecords}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionCard>
  );
}

function PreviewStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/30 p-3">
      <div className="flex items-center gap-2 text-secondary">
        <span className="text-secondary/70 shrink-0">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary/80">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-bold text-primary">{value}</p>
    </div>
  );
}
