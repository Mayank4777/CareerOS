import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ModalShell } from "@/components/ui/modal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { SavedJob, SavedJobFormValues } from "../types";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  source: z.string().optional(),
  url: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  status: z.enum(["saved", "applied", "archived"]).optional(),
  description: z.string().optional(),
});

interface SaveJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SavedJobFormValues) => Promise<void>;
  initialValues?: SavedJob | null;
  isLoading?: boolean;
}

export function SaveJobModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
}: SaveJobModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavedJobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salaryRange: "",
      source: "",
      url: "",
      status: "saved",
      description: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title,
        company: initialValues.company,
        location: initialValues.location,
        salaryRange: initialValues.salaryRange,
        source: initialValues.source,
        url: initialValues.url,
        status: initialValues.status,
        description: initialValues.description,
      });
    } else {
      reset({
        title: "",
        company: "",
        location: "",
        salaryRange: "",
        source: "",
        url: "",
        status: "saved",
        description: "",
      });
    }
  }, [initialValues, reset, isOpen]);

  const onFormSubmit = async (data: SavedJobFormValues) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <ModalShell
      open={isOpen}
      titleId="save-job-modal-title"
      panelClassName="max-w-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="save-job-modal-title" className="text-lg font-semibold text-primary">
          {initialValues ? "Edit Saved Job" : "Save New Opportunity"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField label="Job Title" htmlFor="job-title" error={errors.title?.message} required>
          <Input id="job-title" placeholder="e.g. Senior Frontend Engineer" {...register("title")} />
        </FormField>

        <FormField label="Company Name" htmlFor="company-name" error={errors.company?.message} required>
          <Input id="company-name" placeholder="e.g. Acme Corp" {...register("company")} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Location" htmlFor="job-location" error={errors.location?.message}>
            <Input id="job-location" placeholder="e.g. Remote / New York" {...register("location")} />
          </FormField>

          <FormField label="Salary Range" htmlFor="salary-range" error={errors.salaryRange?.message}>
            <Input id="salary-range" placeholder="e.g. $120,000 - $150,000" {...register("salaryRange")} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Source" htmlFor="job-source" error={errors.source?.message}>
            <Input id="job-source" placeholder="e.g. LinkedIn, Indeed" {...register("source")} />
          </FormField>

          <FormField label="Job Posting URL" htmlFor="job-url" error={errors.url?.message}>
            <Input id="job-url" placeholder="https://..." {...register("url")} />
          </FormField>
        </div>

        <FormField label="Description / Notes" htmlFor="job-description" error={errors.description?.message}>
          <Textarea
            id="job-description"
            rows={3}
            placeholder="Key requirements, notes, or highlights..."
            {...register("description")}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialValues ? "Update Job" : "Save Job"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
