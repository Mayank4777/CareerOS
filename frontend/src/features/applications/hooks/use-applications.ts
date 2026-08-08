import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import {
  fetchApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../services/applications-service";
import type { ApplicationFormValues } from "../types";

export const APPLICATIONS_QUERY_KEY = ["applications"];

export function useApplications(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, params],
    queryFn: () => fetchApplications(params),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: ApplicationFormValues) => createApplication(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      toast.success("Application created", "Job application tracked successfully.");
    },
    onError: () => {
      toast.error("Failed to create application", "Please check your input and try again.");
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ applicationId, payload }: { applicationId: string; payload: Partial<ApplicationFormValues> }) =>
      updateApplication({ applicationId, payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      toast.success("Application updated", "Your application changes were saved.");
    },
    onError: () => {
      toast.error("Failed to update application", "Please check your input and try again.");
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (applicationId: string) => deleteApplication(applicationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      toast.success("Application deleted", "The application was removed from your tracking board.");
    },
    onError: () => {
      toast.error("Failed to delete application", "An error occurred while deleting the application.");
    },
  });
}
