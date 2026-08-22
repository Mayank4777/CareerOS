import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ResumeGeneratePayload } from "../types/resume";

interface ResumeGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ResumeGeneratePayload) => Promise<void>;
  isLoading?: boolean;
}

export function ResumeGenerateDialog({ open, onClose, onSubmit, isLoading }: ResumeGenerateDialogProps) {
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [template, setTemplate] = useState("modern");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      target_role: targetRole.trim(),
      job_description: jobDescription.trim(),
      template,
    });

    setTitle("");
    setTargetRole("");
    setJobDescription("");
    onClose();
  };

  return (
    <ModalShell open={open} titleId="generate-resume-modal" panelClassName="max-w-xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 id="generate-resume-modal" className="text-base font-bold text-primary">
                CareerOS Resume Generator
              </h3>
              <p className="text-xs text-secondary">
                Automatically composes, formats, and ranks your Career Profile items.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-xs text-secondary hover:text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Resume Title" htmlFor="gen-title" required>
            <Input
              id="gen-title"
              placeholder="e.g. Senior Frontend Lead Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Role" htmlFor="gen-role">
              <Input
                id="gen-role"
                placeholder="e.g. Staff Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </FormField>

            <FormField label="Template Style" htmlFor="gen-template">
              <select
                id="gen-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="modern">Modern Professional</option>
                <option value="ats">ATS Classic Clean</option>
                <option value="executive">Executive Dark Header</option>
                <option value="minimal">Minimalist Layout</option>
                <option value="professional">Corporate Standard</option>
              </select>
            </FormField>
          </div>

          <FormField label="Target Job Description (Optional for AI Keyword Matching)" htmlFor="gen-jd">
            <textarea
              id="gen-jd"
              rows={4}
              placeholder="Paste the job posting text here. CareerOS will automatically highlight missing keywords and rank relevant experiences..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-primary focus:border-indigo-500 focus:outline-none resize-none"
            />
          </FormField>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-secondary space-y-1">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" /> How CareerOS works
            </p>
            <p>
              Your Career Profile is the source of truth. Empty profile sections disappear automatically, and missing information is highlighted.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading} className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isLoading ? "Analyzing & Generating..." : "Generate Resume"}
            </Button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
