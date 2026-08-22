import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ModalShell } from "@/components/ui/modal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useApplications } from "@/features/applications/hooks/use-applications";
import type { Interview, InterviewFormValues } from "../types";

const interviewSchema = z.object({
  application: z.string().min(1, "Please select an application"),
  round: z.string().min(1, "Interview round title is required"),
  interviewType: z.enum(["screening", "technical", "behavioral", "system_design", "hr", "final"]),
  scheduledAt: z.string().min(1, "Date and time are required"),
  status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).optional(),
  locationOrLink: z.string().optional(),
  interviewerName: z.string().optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
});

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: InterviewFormValues) => Promise<void>;
  initialValues?: Interview | null;
  isLoading?: boolean;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
}: ScheduleInterviewModalProps) {
  const { data: applications } = useApplications();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      application: "",
      round: "Technical Interview",
      interviewType: "technical",
      scheduledAt: new Date().toISOString().slice(0, 16),
      status: "scheduled",
      locationOrLink: "",
      interviewerName: "",
      notes: "",
      feedback: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        application: initialValues.application,
        round: initialValues.round,
        interviewType: initialValues.interviewType,
        scheduledAt: new Date(initialValues.scheduledAt).toISOString().slice(0, 16),
        status: initialValues.status,
        locationOrLink: initialValues.locationOrLink,
        interviewerName: initialValues.interviewerName,
        notes: initialValues.notes,
        feedback: initialValues.feedback,
      });
    } else if (applications && applications.length > 0) {
      reset({
        application: applications[0].id,
        round: "Technical Interview",
        interviewType: "technical",
        scheduledAt: new Date().toISOString().slice(0, 16),
        status: "scheduled",
        locationOrLink: "",
        interviewerName: "",
        notes: "",
        feedback: "",
      });
    }
  }, [initialValues, applications, reset, isOpen]);

  const onFormSubmit = async (data: InterviewFormValues) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <ModalShell
      open={isOpen}
      titleId="interview-modal-title"
      panelClassName="max-w-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="interview-modal-title" className="text-lg font-semibold text-primary">
          {initialValues ? "Edit Interview Session" : "Schedule Interview Session"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField label="Target Application" htmlFor="interview-app" error={errors.application?.message} required>
          <select
            id="interview-app"
            {...register("application")}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary focus:outline-none"
          >
            {applications?.map((app) => (
              <option key={app.id} value={app.id}>
                {app.position} at {app.company}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Round Name" htmlFor="interview-round" error={errors.round?.message} required>
            <Input id="interview-round" placeholder="e.g. Technical Round 1" {...register("round")} />
          </FormField>

          <FormField label="Interview Type" htmlFor="interview-type">
            <select
              id="interview-type"
              {...register("interviewType")}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary focus:outline-none"
            >
              <option value="screening">Screening Call</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="system_design">System Design</option>
              <option value="hr">HR / Culture Fit</option>
              <option value="final">Final Round</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Date & Time" htmlFor="interview-date" error={errors.scheduledAt?.message} required>
            <Input id="interview-date" type="datetime-local" {...register("scheduledAt")} />
          </FormField>

          <FormField label="Interviewer Name" htmlFor="interview-interviewer" error={errors.interviewerName?.message}>
            <Input id="interview-interviewer" placeholder="e.g. Alex Rivera" {...register("interviewerName")} />
          </FormField>
        </div>

        <FormField label="Meeting Link / Location" htmlFor="interview-link" error={errors.locationOrLink?.message}>
          <Input id="interview-link" placeholder="https://zoom.us/j/..." {...register("locationOrLink")} />
        </FormField>

        <FormField label="Preparation Notes" htmlFor="interview-notes" error={errors.notes?.message}>
          <Textarea
            id="interview-notes"
            rows={2}
            placeholder="Key points to highlight, questions to ask..."
            {...register("notes")}
          />
        </FormField>

        {initialValues && (
          <FormField label="Post-Interview Feedback" htmlFor="interview-feedback" error={errors.feedback?.message}>
            <Textarea
              id="interview-feedback"
              rows={2}
              placeholder="How did it go? Notes for follow-up..."
              {...register("feedback")}
            />
          </FormField>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Scheduling..." : initialValues ? "Update Session" : "Schedule Interview"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
