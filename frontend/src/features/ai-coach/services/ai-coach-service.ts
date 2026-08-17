import { AI_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type {
  AIChatResponse,
  CoverLetterResponse,
  SkillGapResponse,
  CareerAdviceResponse,
  JobMatchResponse,
  ResumeReviewResult,
  SkillGapJobResult,
  AIHistoryItem,
  CareerRoadmap,
  RoadmapPhase,
  GenerateRoadmapPayload,
  CreateRoadmapPhasePayload,
  UpdateRoadmapPhasePayload,
  UpdateRoadmapPayload,
} from "../types";




export async function sendAIChat(payload: {
  prompt: string;
  feature?: string;
}): Promise<AIChatResponse> {
  const response = await apiClient.post<
    ApiResponse<{
      feature: string;
      model: string;
      response: string;
      tokens: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
      history_id?: string;
    }>
  >(AI_ROUTES.chat, {
    prompt: payload.prompt,
    feature: payload.feature ?? "career_chat",
  });

  const data = response.data.data;
  if (!data) throw new Error("No data returned from AI server");

  return {
    feature: data.feature,
    model: data.model,
    response: data.response,
    tokens: {
      promptTokens: data.tokens.prompt_tokens,
      completionTokens: data.tokens.completion_tokens,
      totalTokens: data.tokens.total_tokens,
    },
    historyId: data.history_id,
  };
}

export async function generateCoverLetter(payload: {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  tone?: string;
}): Promise<CoverLetterResponse> {
  const response = await apiClient.post<ApiResponse<{ cover_letter: string; history_id: string }>>(
    AI_ROUTES.coverLetter,
    {
      company_name: payload.companyName,
      job_title: payload.jobTitle,
      job_description: payload.jobDescription,
      tone: payload.tone,
    }
  );
  const data = response.data.data;
  if (!data) throw new Error("No data returned");
  return {
    coverLetter: data.cover_letter,
    historyId: data.history_id,
  };
}

export async function analyzeSkillGap(payload: {
  targetRole: string;
  requiredSkills?: string[];
}): Promise<SkillGapResponse> {
  const response = await apiClient.post<
    ApiResponse<{
      target_role: string;
      readiness_score: number;
      matching_skills: string[];
      missing_skills: string[];
      recommendations: string[];
    }>
  >(AI_ROUTES.skillGap, {
    target_role: payload.targetRole,
    required_skills: payload.requiredSkills,
  });

  const data = response.data.data;
  if (!data) throw new Error("No data returned");

  return {
    targetRole: data.target_role,
    readinessScore: data.readiness_score,
    matchingSkills: data.matching_skills,
    missingSkills: data.missing_skills,
    recommendations: data.recommendations,
  };
}

export async function getCareerAdvice(payload: {
  targetRole?: string;
  industry?: string;
}): Promise<CareerAdviceResponse> {
  const response = await apiClient.post<
    ApiResponse<{
      target_role: string;
      industry: string;
      actionable_insights: string[];
      recommended_next_steps: string[];
    }>
  >(AI_ROUTES.careerAdvice, {
    target_role: payload.targetRole,
    industry: payload.industry,
  });

  const data = response.data.data;
  if (!data) throw new Error("No data returned");

  return {
    targetRole: data.target_role,
    industry: data.industry,
    actionableInsights: data.actionable_insights,
    recommendedNextSteps: data.recommended_next_steps,
  };
}

export async function getJobMatch(payload: {
  jobId: string;
  resumeId: string;
}): Promise<JobMatchResponse> {
  const response = await apiClient.post<
    ApiResponse<{
      id: string;
      job_id: string;
      resume_id: string;
      match_score: number;
      strengths: string[];
      missing_skills: string[];
      gaps: string[];
      recommendations: string[];
      analyzed_at: string;
    }>
  >(AI_ROUTES.jobMatch, {
    job_id: payload.jobId,
    resume_id: payload.resumeId,
  });

  const data = response.data.data;
  if (!data) throw new Error("No data returned from AI server");

  return {
    id: data.id,
    jobId: data.job_id,
    resumeId: data.resume_id,
    matchScore: data.match_score,
    strengths: data.strengths,
    missingSkills: data.missing_skills,
    gaps: data.gaps,
    recommendations: data.recommendations,
    analyzedAt: data.analyzed_at,
  };
}

export async function reviewResume(payload: {
  resumeId: string;
}): Promise<ResumeReviewResult> {
  const response = await apiClient.post<ApiResponse<ResumeReviewResult>>(
    AI_ROUTES.resumeReview,
    {
      resume_id: payload.resumeId,
    }
  );

  const data = response.data.data;
  if (!data) throw new Error("No data returned from AI server");

  return data;
}

export async function analyzeJobSkillGap(payload: {
  jobId: string;
}): Promise<SkillGapJobResult> {
  const response = await apiClient.post<ApiResponse<SkillGapJobResult>>(
    AI_ROUTES.skillGap,
    {
      job_id: payload.jobId,
    }
  );

  const data = response.data.data;
  if (!data) throw new Error("No data returned from AI server");

  return data;
}


export async function fetchAIHistory(): Promise<AIHistoryItem[]> {

  const response = await apiClient.get<
    ApiResponse<
      Array<{
        id: string;
        feature: string;
        provider: string;
        model: string;
        total_tokens: number;
        created_at: string;
      }>
    >
  >(AI_ROUTES.history);

  return (response.data.data ?? []).map((item) => ({
    id: item.id,
    feature: item.feature,
    provider: item.provider,
    model: item.model,
    totalTokens: item.total_tokens,
    createdAt: item.created_at,
  }));
}

export async function fetchRoadmaps(): Promise<CareerRoadmap[]> {
  const response = await apiClient.get<ApiResponse<CareerRoadmap[]>>(AI_ROUTES.roadmapList);
  return response.data.data ?? [];
}

export async function fetchRoadmapDetail(roadmapId: string): Promise<CareerRoadmap> {
  const response = await apiClient.get<ApiResponse<CareerRoadmap>>(AI_ROUTES.roadmapDetail(roadmapId));
  const data = response.data.data;
  if (!data) throw new Error("Career roadmap not found.");
  return data;
}

export async function generateRoadmap(payload: GenerateRoadmapPayload): Promise<CareerRoadmap> {
  const response = await apiClient.post<ApiResponse<CareerRoadmap>>(
    AI_ROUTES.roadmapGenerate,
    payload
  );
  const data = response.data.data;
  if (!data) throw new Error("Failed to generate career roadmap.");
  return data;
}

export async function updateRoadmap(
  roadmapId: string,
  payload: UpdateRoadmapPayload
): Promise<CareerRoadmap> {
  const response = await apiClient.patch<ApiResponse<CareerRoadmap>>(
    AI_ROUTES.roadmapDetail(roadmapId),
    payload
  );
  const data = response.data.data;
  if (!data) throw new Error("Failed to update career roadmap.");
  return data;
}

export async function deleteRoadmap(roadmapId: string): Promise<void> {
  await apiClient.delete(AI_ROUTES.roadmapDetail(roadmapId));
}

export async function createRoadmapPhase(
  roadmapId: string,
  payload: CreateRoadmapPhasePayload
): Promise<RoadmapPhase> {
  const response = await apiClient.post<ApiResponse<RoadmapPhase>>(
    AI_ROUTES.roadmapPhases(roadmapId),
    payload
  );
  const data = response.data.data;
  if (!data) throw new Error("Failed to create roadmap phase.");
  return data;
}

export async function updateRoadmapPhase(
  roadmapId: string,
  phaseId: string,
  payload: UpdateRoadmapPhasePayload
): Promise<RoadmapPhase> {
  const response = await apiClient.patch<ApiResponse<RoadmapPhase>>(
    AI_ROUTES.roadmapPhaseDetail(roadmapId, phaseId),
    payload
  );
  const data = response.data.data;
  if (!data) throw new Error("Failed to update roadmap phase.");
  return data;
}

export async function deleteRoadmapPhase(
  roadmapId: string,
  phaseId: string
): Promise<void> {
  await apiClient.delete(AI_ROUTES.roadmapPhaseDetail(roadmapId, phaseId));
}

