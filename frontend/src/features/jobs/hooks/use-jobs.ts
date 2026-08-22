import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import {
  fetchSavedJobs,
  createSavedJob,
  updateSavedJob,
  deleteSavedJob,
} from "../services/jobs-service";
import type { SavedJobFormValues } from "../types";

export const JOBS_QUERY_KEY = ["jobs"];

export function useSavedJobs(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, "saved", params],
    queryFn: () => fetchSavedJobs(params),
  });
}

export function useCreateSavedJob() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: SavedJobFormValues) => createSavedJob(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      toast.success("Job saved", "New opportunity added to your saved jobs.");
    },
    onError: () => {
      toast.error("Failed to save job", "Please check the required fields and try again.");
    },
  });
}

export function useUpdateSavedJob() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: Partial<SavedJobFormValues> }) =>
      updateSavedJob({ jobId, payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      toast.success("Job updated", "Your job changes were saved.");
    },
    onError: () => {
      toast.error("Failed to update job", "Please check your changes and try again.");
    },
  });
}

export function useDeleteSavedJob() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (jobId: string) => deleteSavedJob(jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      toast.success("Job removed", "The saved job was removed from your list.");
    },
    onError: () => {
      toast.error("Failed to remove job", "An error occurred while removing the job.");
    },
  });
}
