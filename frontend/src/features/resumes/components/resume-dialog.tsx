import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ModalShell } from "@/components/ui/modal-shell";
import type { ApiError } from "@/types/api";
import type { Resume, ResumeFormValues } from "@/features/resumes/types/resume";
import {
  createResumeSchema,
  renameResumeSchema,
} from "@/features/resumes/validation/resume";

type ResumeDialogMode = "create" | "rename";

interface ResumeDialogProps {
  open: boolean;
  mode: ResumeDialogMode;
  resume: Resume | null;
  onClose: () => void;
  onSubmit: (values: ResumeFormValues) => Promise<void>;
}

const DEFAULT_VALUES: ResumeFormValues = {
  title: "",
  template: "modern",
  status: "draft",
};

export function ResumeDialog({ open, mode, resume, onClose, onSubmit }: ResumeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => (mode === "create" ? createResumeSchema : renameResumeSchema), [mode]);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
    shouldUnregister: true,
  });

  const title = useMemo(
    () => (mode === "create" ? "Create resume" : "Rename resume"),
    [mode]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      mode === "create"
        ? DEFAULT_VALUES
        : {
            title: resume?.title ?? "",
            template: resume?.template ?? "modern",
            status: resume?.status ?? "draft",
          }
    );
    setSubmitError(null);
  }, [form, mode, open, resume]);

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [form, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);
    form.clearErrors();

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const response = axios.isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      const generalMessage =
        response?.message ??
        (error instanceof Error && error.message
          ? error.message
          : `We could not save this resume right now.`);
      const fieldErrors = response?.errors;

      if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
        let mappedFieldError = false;

        for (const [key, value] of Object.entries(fieldErrors)) {
          const message = normalizeErrorMessage(value);

          if (key in values && message) {
            form.setError(key as keyof ResumeFormValues, { type: "server", message });
            mappedFieldError = true;
          }
        }

        if (mappedFieldError) {
          setSubmitError("Please fix the highlighted fields and try again.");
          return;
        }
      }

      setSubmitError(generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ModalShell open={open} panelClassName="max-w-xl" titleId="resume-dialog-title">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 id="resume-dialog-title" className="text-lg font-semibold text-primary">
              {title}
            </h3>
            <p className="text-sm leading-6 text-secondary">
              {mode === "create"
                ? "Create a new resume shell before opening the editor."
                : "Rename the resume without changing its content or status."}
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

        <div className="space-y-5">
          <FormField
            htmlFor="resume-title"
            label="Title"
            description="Give the resume a clear, recognizable name."
            error={form.formState.errors.title?.message as string | undefined}
            required
          >
            <Input
              id="resume-title"
              placeholder="Software Engineer Resume"
              {...form.register("title")}
            />
          </FormField>

          {mode === "create" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                htmlFor="resume-template"
                label="Template"
                description="Template metadata only. Rendering comes later."
                error={form.formState.errors.template?.message as string | undefined}
              >
                <select
                  id="resume-template"
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm transition-colors duration-normal focus:border-borderFocus focus:outline-none focus:ring-2 focus:ring-borderFocus/20"
                  {...form.register("template")}
                >
                  <option value="modern">Modern</option>
                  <option value="professional">Professional</option>
                  <option value="minimal">Minimal</option>
                  <option value="executive">Executive</option>
                  <option value="ats">ATS Friendly</option>
                </select>
              </FormField>

              <FormField
                htmlFor="resume-status"
                label="Status"
                description="Set the initial lifecycle state."
                error={form.formState.errors.status?.message as string | undefined}
                required
              >
                <select
                  id="resume-status"
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm transition-colors duration-normal focus:border-borderFocus focus:outline-none focus:ring-2 focus:ring-borderFocus/20"
                  {...form.register("status")}
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="applied">Applied</option>
                  <option value="archived">Archived</option>
                </select>
              </FormField>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isSubmitting} type="submit">
            {mode === "create" ? "Create resume" : "Save changes"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function normalizeErrorMessage(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}
