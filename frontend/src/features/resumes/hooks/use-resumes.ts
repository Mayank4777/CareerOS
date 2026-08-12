import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyResumeSuggestion,
  createResume,
  createResumeVersion,
  deleteResume,
  fetchResume,
  fetchResumes,
  fetchResumeVersions,
  generateResume,
  restoreResumeVersion,
  reviewResume,
  updateResume,
} from "../services/resumes";
import type { ResumeGeneratePayload, ResumePayload } from "../types/resume";

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });
}

export function useResume(resumeId: string) {
  return useQuery({
    queryKey: ["resumes", resumeId],
    queryFn: () => fetchResume(resumeId),
    enabled: Boolean(resumeId),
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResumePayload) => createResume(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useGenerateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResumeGeneratePayload) => generateResume(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resumeId, payload }: { resumeId: string; payload: Partial<ResumePayload> }) =>
      updateResume(resumeId, payload),
    onSuccess: (_, { resumeId }) => {
      void queryClient.invalidateQueries({ queryKey: ["resumes"] });
      void queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resumeId: string) => deleteResume(resumeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useReviewResume(resumeId: string) {
  return useMutation({
    mutationFn: () => reviewResume(resumeId),
  });
}

export function useApplySuggestion(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestion: { section_key?: string; original_text: string; suggested_text: string }) =>
      applyResumeSuggestion(resumeId, suggestion),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
    },
  });
}

export function useResumeVersions(resumeId: string) {
  return useQuery({
    queryKey: ["resumes", resumeId, "versions"],
    queryFn: () => fetchResumeVersions(resumeId),
    enabled: Boolean(resumeId),
  });
}

export function useCreateVersion(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; commit_message?: string; tags?: string[] }) =>
      createResumeVersion(resumeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumes", resumeId, "versions"] });
    },
  });
}

export function useRestoreVersion(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => restoreResumeVersion(resumeId, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
      void queryClient.invalidateQueries({ queryKey: ["resumes", resumeId, "versions"] });
    },
  });
}
