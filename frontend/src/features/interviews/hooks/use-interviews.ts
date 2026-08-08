import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import {
  fetchInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../services/interviews-service";
import type { InterviewFormValues } from "../types";

export const INTERVIEWS_QUERY_KEY = ["interviews"];

export function useInterviews(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...INTERVIEWS_QUERY_KEY, params],
    queryFn: () => fetchInterviews(params),
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: InterviewFormValues) => createInterview(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INTERVIEWS_QUERY_KEY });
      toast.success("Interview scheduled", "Interview round added to your schedule.");
    },
    onError: () => {
      toast.error("Failed to schedule interview", "Please check the input fields.");
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ interviewId, payload }: { interviewId: string; payload: Partial<InterviewFormValues> }) =>
      updateInterview({ interviewId, payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INTERVIEWS_QUERY_KEY });
      toast.success("Interview updated", "Your interview changes were saved.");
    },
    onError: () => {
      toast.error("Failed to update interview", "Please check your changes.");
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (interviewId: string) => deleteInterview(interviewId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INTERVIEWS_QUERY_KEY });
      toast.success("Interview deleted", "The interview round was removed.");
    },
    onError: () => {
      toast.error("Failed to delete interview", "An error occurred while removing the interview.");
    },
  });
}
