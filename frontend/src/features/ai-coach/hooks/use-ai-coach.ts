import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendAIChat,
  generateCoverLetter,
  getCareerAdvice,
  getJobMatch,
  analyzeJobSkillGap,
  fetchAIHistory,
  fetchRoadmaps,
  fetchRoadmapDetail,
  generateRoadmap,
  updateRoadmap,
  deleteRoadmap,
  createRoadmapPhase,
  updateRoadmapPhase,
  deleteRoadmapPhase,
} from "../services/ai-coach-service";
import type {
  CreateRoadmapPhasePayload,
  UpdateRoadmapPhasePayload,
  UpdateRoadmapPayload,
} from "../types";


export const AI_COACH_QUERY_KEY = ["ai-coach"];

export function useAIHistory() {
  return useQuery({
    queryKey: [...AI_COACH_QUERY_KEY, "history"],
    queryFn: fetchAIHistory,
  });
}

export function useAIChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendAIChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useGenerateCoverLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateCoverLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useGetCareerAdvice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getCareerAdvice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useGetJobMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getJobMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useAnalyzeJobSkillGap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyzeJobSkillGap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useRoadmaps() {
  return useQuery({
    queryKey: [...AI_COACH_QUERY_KEY, "roadmaps"],
    queryFn: fetchRoadmaps,
  });
}

export function useRoadmapDetail(roadmapId: string | null) {
  return useQuery({
    queryKey: [...AI_COACH_QUERY_KEY, "roadmap", roadmapId],
    queryFn: () => (roadmapId ? fetchRoadmapDetail(roadmapId) : Promise.reject("No roadmap ID")),
    enabled: Boolean(roadmapId),
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, payload }: { roadmapId: string; payload: UpdateRoadmapPayload }) =>
      updateRoadmap(roadmapId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roadmapId: string) => deleteRoadmap(roadmapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useCreateRoadmapPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roadmapId,
      payload,
    }: {
      roadmapId: string;
      payload: CreateRoadmapPhasePayload;
    }) => createRoadmapPhase(roadmapId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useUpdateRoadmapPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roadmapId,
      phaseId,
      payload,
    }: {
      roadmapId: string;
      phaseId: string;
      payload: UpdateRoadmapPhasePayload;
    }) => updateRoadmapPhase(roadmapId, phaseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

export function useDeleteRoadmapPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, phaseId }: { roadmapId: string; phaseId: string }) =>
      deleteRoadmapPhase(roadmapId, phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_COACH_QUERY_KEY });
    },
  });
}

