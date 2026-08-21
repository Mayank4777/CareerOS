import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Save, Sparkles, Target, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/constants/routes";

interface ResumeToolbarProps {
  title: string;
  targetRole: string;
  template: string;
  onTargetRoleChange: (role: string) => void;
  onTemplateChange: (template: string) => void;
  onImproveAllWithAI: () => void;
  onSave: () => void;
  onDownloadPDF: () => void;
  isSaving?: boolean;
  isGeneratingAI?: boolean;
  viewMode: "split" | "preview" | "editor";
  onViewModeChange: (mode: "split" | "preview" | "editor") => void;
}

const TEMPLATE_OPTIONS = [
  { value: "modern", label: "Modern Clean" },
  { value: "ats", label: "ATS Standard" },
  { value: "executive", label: "Executive Leadership" },
  { value: "minimal", label: "Minimalist" },
  { value: "professional", label: "Professional" },
];

export function ResumeToolbar({
  title,
  targetRole,
  template,
  onTargetRoleChange,
  onTemplateChange,
  onImproveAllWithAI,
  onSave,
  onDownloadPDF,
  isSaving = false,
  isGeneratingAI = false,
  viewMode,
  onViewModeChange,
}: ResumeToolbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Navigation & Title & Target Role */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground">
            <Link to={APP_ROUTES.resume}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Resumes
            </Link>
          </Button>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          <div>
            <h1 className="text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
              {title || "Resume Builder"}
            </h1>
          </div>

          {/* Target Role Input */}
          <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-1 border border-border shadow-inner">
            <Target className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground shrink-0 hidden md:inline">Target:</span>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none w-36 sm:w-48 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right: Template, AI Improve, Save, Export PDF */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Select */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs">
            <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={template}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            >
              {TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Selector (Responsive) */}
          <div className="hidden xl:flex items-center rounded-xl border border-border bg-surface p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onViewModeChange("split")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === "split" ? "bg-surface-elevated text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("editor")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === "editor" ? "bg-surface-elevated text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("preview")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === "preview" ? "bg-surface-elevated text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>

          {/* AI Improve All Button */}
          <Button
            size="sm"
            onClick={onImproveAllWithAI}
            disabled={isGeneratingAI}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold shadow-md hover:brightness-110"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300 animate-pulse" />
            {isGeneratingAI ? "Analyzing..." : "Improve with AI"}
          </Button>

          {/* Save Button */}
          <Button size="sm" variant="secondary" onClick={onSave} disabled={isSaving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          {/* Download PDF Button */}
          <Button size="sm" variant="outline" onClick={onDownloadPDF} className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
            <Download className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
            Export PDF
          </Button>
        </div>
      </div>
    </header>
  );
}
