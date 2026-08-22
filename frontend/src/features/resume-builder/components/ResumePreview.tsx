import React from "react";
import type { ResumeBuilderData } from "../types/resume-builder";
import { ModernResume } from "../templates/Modern/ModernResume";

interface ResumePreviewProps {
  data: ResumeBuilderData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <div className="flex flex-col items-center justify-start overflow-x-auto p-4 sm:p-6 bg-surface-dark/40 rounded-3xl border border-border/60 min-h-[700px] shadow-inner">
      <div className="w-full max-w-[210mm] transition-all transform origin-top duration-200">
        <ModernResume data={data} />
      </div>
    </div>
  );
}
