import { useState, useRef, type ReactNode } from "react";
import { EyeOff, Layers3, Sparkles, FileText, Printer, Download, ZoomIn, ZoomOut, RotateCcw, Maximize2, X, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/cards/section-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RESUME_EDITOR_SECTIONS } from "@/features/resumes/data/resume-editor-sections";
import type { Resume } from "@/features/resumes/types/resume";
import type {
  ResumeEditorSection,
  ResumeEditorSectionItem,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";
import { RESUME_TEMPLATES } from "@/features/resumes/templates";
import { exportElementToPDF } from "@/lib/pdf-export";

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
  const toast = useToast();
  const [zoom, setZoom] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const printTargetRef = useRef<HTMLDivElement>(null);
  const modalPrintTargetRef = useRef<HTMLDivElement>(null);

  const visibleSections = sections.filter((section) => section.is_visible);
  const currentSectionDefinition = RESUME_EDITOR_SECTIONS.find((section) => section.type === selectedSectionType);

  const activeTemplateName = resume.template || "ats";
  const TemplateComponent = RESUME_TEMPLATES[activeTemplateName] || RESUME_TEMPLATES["ats"];

  const handleDownloadPDF = async () => {
    const target = isFullScreenOpen ? modalPrintTargetRef.current : printTargetRef.current;
    if (!target) return;

    try {
      setIsExporting(true);
      toast.info("Generating PDF", "Converting document to high-resolution PDF...");
      await exportElementToPDF(target, `${resume.title.replaceAll(" ", "_")}_Resume.pdf`);
      toast.success("PDF Downloaded", `Saved "${resume.title}.pdf" to your downloads.`);
    } catch (err: any) {
      toast.error("Export Failed", err.message || "Could not generate PDF download.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      <SectionCard
        title="Live Preview & Export"
        description="Real-time A4 preview with instant 1-click PDF download & full screen view."
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

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Template:</span>
                  <select
                    value={activeTemplateName}
                    onChange={(e) => onUpdateTemplate(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-primary shadow-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="ats">ATS Clean Serif (Default)</option>
                    <option value="modern">Modern Minimal</option>
                    <option value="executive">Executive Grid</option>
                    <option value="minimal">Minimal Split</option>
                    <option value="professional">Corporate Dark</option>
                  </select>
                </div>

                {/* Direct 1-Click PDF Download Button */}
                <Button
                  variant="gradient"
                  size="sm"
                  disabled={isExporting}
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20"
                >
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {isExporting ? "Exporting..." : "Download PDF"}
                </Button>
              </div>
            </div>

            {/* Controls toolbar for Zoom & Full Screen */}
            <div className="flex items-center justify-between gap-2 bg-surface/50 p-2 rounded-xl border border-border/60">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom((z) => Math.max(70, z - 10))}
                  className="h-7 w-7 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] font-bold text-secondary font-mono w-10 text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                  className="h-7 w-7 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                {zoom !== 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom(100)}
                    className="h-7 px-2 text-[10px]"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Reset
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreenOpen(true)}
                  className="h-7 text-xs flex items-center gap-1.5"
                  title="Full Screen Preview"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-cyan-400" /> Full Screen
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintPDF}
                  className="h-7 text-xs flex items-center gap-1.5"
                  title="Print Dialog"
                >
                  <Printer className="h-3.5 w-3.5 text-indigo-400" /> Print
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <PreviewStat label="Visible sections" value={String(visibleSections.length || 6)} icon={<Layers3 className="h-4 w-4" />} />
              <PreviewStat label="Selected section" value={currentSectionDefinition?.label ?? "Overview"} icon={<Sparkles className="h-4 w-4" />} />
              <PreviewStat label="Included records" value={String(selectedItems.length || "Auto All")} icon={<EyeOff className="h-4 w-4" />} />
            </div>

            <div className="max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
              <div className="mx-auto w-full max-w-[620px] py-2">
                <div
                  id="resume-print-target"
                  ref={printTargetRef}
                  className="aspect-[210/297] rounded-[12px] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_1px_rgba(0,0,0,0.2)] overflow-hidden transition-transform duration-200 origin-top"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
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

      {/* FULL SCREEN PREVIEW OVERLAY MODAL */}
      {isFullScreenOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4 md:p-6 overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 shadow-md mb-4 text-white">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">{resume.title} — Full Screen Preview</h2>
                <p className="text-[11px] text-slate-400">Template: {activeTemplateName.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800 rounded-md px-2.5 py-1 border border-slate-700">
                <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(70, z - 10))} className="h-6 w-6 p-0 text-white">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-mono font-bold w-8 text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(180, z + 10))} className="h-6 w-6 p-0 text-white">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button variant="gradient" size="sm" onClick={handleDownloadPDF} disabled={isExporting} className="gap-2 font-bold">
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? "Exporting..." : "Download PDF"}
              </Button>

              <Button variant="outline" size="sm" onClick={handlePrintPDF} className="gap-2 border-slate-700 text-white hover:bg-slate-800">
                <Printer className="h-4 w-4 text-indigo-400" /> Print
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullScreenOpen(false)}
                className="h-9 w-9 p-0 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Full Screen A4 Viewer */}
          <div className="flex-1 overflow-y-auto flex justify-center items-start p-4">
            <div
              ref={modalPrintTargetRef}
              className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-lg overflow-hidden transition-transform duration-200 origin-top my-auto"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <TemplateComponent
                resume={resume}
                sections={sections}
                allSectionItems={allSectionItems}
                allSourceRecords={allSourceRecords}
              />
            </div>
          </div>
        </div>
      )}
    </>
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
