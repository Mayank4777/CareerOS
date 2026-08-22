import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ModalShell } from "@/components/ui/modal-shell";
import type { ApiError } from "@/types/api";
import type { ResumeEditorSection, ResumeEditorSectionFormValues, ResumeEditorSectionType } from "@/features/resumes/types/resume-editor";

const sectionSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  isVisible: z.boolean(),
});

interface ResumeEditorSectionDialogProps {
  open: boolean;
  mode: "create" | "rename";
  sectionType: ResumeEditorSectionType;
  section: ResumeEditorSection | null;
  defaultTitle: string;
  onClose: () => void;
  onSubmit: (values: ResumeEditorSectionFormValues) => Promise<void>;
}

export function ResumeEditorSectionDialog({
  open,
  mode,
  sectionType,
  section,
  defaultTitle,
  onClose,
  onSubmit,
}: ResumeEditorSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ResumeEditorSectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: defaultTitle,
      isVisible: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      title: mode === "create" ? defaultTitle : section?.title ?? defaultTitle,
      isVisible: mode === "create" ? true : Boolean(section?.is_visible),
    });
    setSubmitError(null);
  }, [defaultTitle, form, mode, open, section]);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setSubmitError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const response = axios.isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      setSubmitError(
        response?.message ??
          (error instanceof Error && error.message ? error.message : "We could not save this section right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ModalShell open={open} panelClassName="max-w-lg" titleId="resume-editor-section-dialog-title">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 id="resume-editor-section-dialog-title" className="text-lg font-semibold text-primary">
              {mode === "create" ? `Add ${defaultTitle}` : `Rename ${defaultTitle}`}
            </h3>
            <p className="text-sm leading-6 text-secondary">
              {mode === "create"
                ? "Create the resume section before adding records."
                : "Update the section title or visibility."}
            </p>
          </div>

          <Button aria-label="Close modal" type="button" size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form className="space-y-5 px-6 py-5" onSubmit={handleSubmit}>
        {submitError ? (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-primary">
            {submitError}
          </div>
        ) : null}

        <FormField
          htmlFor="resume-section-title"
          label="Section title"
          description="Keep this aligned with the section purpose."
          error={form.formState.errors.title?.message as string | undefined}
          required
        >
          <Input id="resume-section-title" placeholder={defaultTitle} {...form.register("title")} />
        </FormField>

        <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border text-brand-600 focus:ring-borderFocus"
            {...form.register("isVisible")}
          />
          <span className="space-y-1">
            <span className="block text-sm font-medium text-primary">Visible in resume preview</span>
            <span className="block text-xs leading-5 text-secondary">
              Hidden sections stay saved but do not appear in the preview placeholder.
            </span>
          </span>
        </label>

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isSubmitting} type="submit">
            {mode === "create" ? "Create section" : "Save changes"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

