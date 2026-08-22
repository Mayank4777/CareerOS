import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ModalShell } from "@/components/ui/modal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { Application, ApplicationFormValues, ApplicationStatus } from "../types";

const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position title is required"),
  status: z.enum(["wishlist", "applied", "interviewing", "offer", "rejected", "accepted"]).optional(),
  appliedAt: z.string().optional().nullable(),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  notes: z.string().optional(),
});

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  initialValues?: Application | null;
  isLoading?: boolean;
}

export function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
}: ApplicationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: "",
      position: "",
      status: "applied",
      appliedAt: new Date().toISOString().split("T")[0],
      location: "",
      salary: "",
      jobUrl: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        company: initialValues.company,
        position: initialValues.position,
        status: initialValues.status,
        appliedAt: initialValues.appliedAt ?? "",
        location: initialValues.location,
        salary: initialValues.salary,
        jobUrl: initialValues.jobUrl,
        notes: initialValues.notes,
      });
    } else {
      reset({
        company: "",
        position: "",
        status: "applied",
        appliedAt: new Date().toISOString().split("T")[0],
        location: "",
        salary: "",
        jobUrl: "",
        notes: "",
      });
    }
  }, [initialValues, reset, isOpen]);

  const onFormSubmit = async (data: ApplicationFormValues) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <ModalShell
      open={isOpen}
      titleId="application-modal-title"
      panelClassName="max-w-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="application-modal-title" className="text-lg font-semibold text-primary">
          {initialValues ? "Edit Application" : "New Application Record"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField label="Company Name" htmlFor="app-company" error={errors.company?.message} required>
          <Input id="app-company" placeholder="e.g. Google" {...register("company")} />
        </FormField>

        <FormField label="Position Title" htmlFor="app-position" error={errors.position?.message} required>
          <Input id="app-position" placeholder="e.g. Senior Software Engineer" {...register("position")} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Application Status" htmlFor="app-status">
            <select
              id="app-status"
              {...register("status")}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary focus:outline-none"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer Received</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </FormField>

          <FormField label="Application Date" htmlFor="app-date" error={errors.appliedAt?.message}>
            <Input id="app-date" type="date" {...register("appliedAt")} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Location" htmlFor="app-location" error={errors.location?.message}>
            <Input id="app-location" placeholder="e.g. Remote / Seattle, WA" {...register("location")} />
          </FormField>

          <FormField label="Salary Expectation / Offered" htmlFor="app-salary" error={errors.salary?.message}>
            <Input id="app-salary" placeholder="e.g. $150,000 / yr" {...register("salary")} />
          </FormField>
        </div>

        <FormField label="Job URL" htmlFor="app-job-url" error={errors.jobUrl?.message}>
          <Input id="app-job-url" placeholder="https://..." {...register("jobUrl")} />
        </FormField>

        <FormField label="Notes & Follow-ups" htmlFor="app-notes" error={errors.notes?.message}>
          <Textarea
            id="app-notes"
            rows={3}
            placeholder="Recruiter contact, interview prep notes, referral details..."
            {...register("notes")}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialValues ? "Update Application" : "Save Record"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
