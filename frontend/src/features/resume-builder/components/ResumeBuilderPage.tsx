import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useResumeBuilder } from "../hooks/use-resume-builder";
import { ResumeToolbar } from "./ResumeToolbar";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { ResumeImprovementModal } from "./ResumeImprovementModal";

export function ResumeBuilderPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [viewMode, setViewMode] = useState<"split" | "preview" | "editor">("split");

  const {
    isLoading,
    isError,
    resume,
    resumeData,
    improvements,
    improvementReport,
    isImproveModalOpen,
    setIsImproveModalOpen,
    aiSuggestions,
    isGeneratingAI,
    isSaving,
    updatePersonal,
    updateSummary,
    updateTargetRole,
    updateTemplate,
    updateExperience,
    updateProjects,
    updateSkills,
    updateEducation,
    applySkillOrdering,
    improveSectionWithAI,
    improveAllWithAI,
    applySuggestion,
    rejectSuggestion,
    handleSave,
  } = useResumeBuilder(resumeId);

  // PDF Export Trigger
  const handleDownloadPDF = () => {
    const element = document.getElementById("resume-preview-document");
    if (!element) return;
    window.print();
  };

  if (isLoading) {
    return <LoadingState label="Loading Resume Builder and Career Profile..." />;
  }

  if (isError || !resume || !resumeData) {
    return (
      <ErrorState
        description="We could not load your resume and Career Profile. Please try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Toolbar */}
      <ResumeToolbar
        title={resume.title}
        targetRole={resumeData.targetRole}
        template={resumeData.template}
        onTargetRoleChange={updateTargetRole}
        onTemplateChange={updateTemplate}
        onImproveAllWithAI={improveAllWithAI}
        onSave={handleSave}
        onDownloadPDF={handleDownloadPDF}
        isSaving={isSaving}
        isGeneratingAI={isGeneratingAI}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Layout */}
      <main className="flex-1 px-4 py-6 max-w-[1700px] w-full mx-auto">
        {viewMode === "preview" ? (
          <div className="max-w-4xl mx-auto">
            <ResumePreview data={resumeData} />
          </div>
        ) : viewMode === "editor" ? (
          <div className="max-w-3xl mx-auto">
            <ResumeEditor
              data={resumeData}
              improvements={improvements}
              onUpdatePersonal={updatePersonal}
              onUpdateSummary={updateSummary}
              onUpdateExperience={updateExperience}
              onUpdateProjects={updateProjects}
              onUpdateSkills={updateSkills}
              onUpdateEducation={updateEducation}
              onApplySkillOrdering={applySkillOrdering}
              onImproveSectionWithAI={improveSectionWithAI}
              isGeneratingAI={isGeneratingAI}
            />
          </div>
        ) : (
          /* Split View Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Content Editor */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-2 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Resume Content Editor
                </h2>
                <span className="text-xs text-muted-foreground">
                  Source: Career Profile (Auto-synced)
                </span>
              </div>
              <ResumeEditor
                data={resumeData}
                improvements={improvements}
                onUpdatePersonal={updatePersonal}
                onUpdateSummary={updateSummary}
                onUpdateExperience={updateExperience}
                onUpdateProjects={updateProjects}
                onUpdateSkills={updateSkills}
                onUpdateEducation={updateEducation}
                onApplySkillOrdering={applySkillOrdering}
                onImproveSectionWithAI={improveSectionWithAI}
                isGeneratingAI={isGeneratingAI}
              />
            </div>

            {/* Right Column: Live A4 Resume Preview */}
            <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-20">
              <div className="flex items-center justify-between px-2 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Live Resume Preview
                </h2>
                <span className="text-xs font-semibold text-emerald-400">
                  Real-time Update Active
                </span>
              </div>
              <ResumePreview data={resumeData} />
            </div>
          </div>
        )}
      </main>

      {/* AI Improvement Suggestions Modal */}
      <ResumeImprovementModal
        open={isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
        report={improvementReport}
        suggestions={aiSuggestions}
        onApplySuggestion={applySuggestion}
        onRejectSuggestion={rejectSuggestion}
        isGeneratingAI={isGeneratingAI}
      />
    </div>
  );
}
