import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendAIChat,
  generateCoverLetter,
  analyzeSkillGap,
  getCareerAdvice,
  getJobMatch,
  analyzeJobSkillGap,
  fetchAIHistory,
} from "../services/ai-coach-service";


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

export function useAnalyzeSkillGap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyzeSkillGap,
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
