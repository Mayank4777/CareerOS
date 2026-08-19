import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";

import type { Resume, ResumeGeneratePayload, ResumePayload, ResumeRenamePayload } from "@/features/resumes/types/resume";

const RESUMES_ROOT = "/resumes/";

export async function fetchResumes(): Promise<Resume[]> {
  const response = await apiClient.get<ApiResponse<Resume[]>>(RESUMES_ROOT);
  return response.data.data ?? [];
}

export async function fetchResume(resumeId: string): Promise<Resume> {
  const response = await apiClient.get<ApiResponse<Resume>>(`${RESUMES_ROOT}${resumeId}/`);
  const data = response.data.data;

  if (!data) {
    throw new Error("Resume response was empty.");
  }

  return data;
}

export async function createResume(payload: ResumePayload): Promise<Resume> {
  const response = await apiClient.post<ApiResponse<Resume>>(RESUMES_ROOT, payload);
  const data = response.data.data;

  if (!data) {
    throw new Error("Resume response was empty.");
  }

  return data;
}

export async function generateResume(payload: ResumeGeneratePayload): Promise<Resume> {
  const response = await apiClient.post<ApiResponse<Resume>>(`${RESUMES_ROOT}generate/`, payload);
  const data = response.data.data;

  if (!data) {
    throw new Error("Generate resume response was empty.");
  }

  return data;
}

export async function updateResume(resumeId: string, payload: Partial<ResumePayload> | ResumeRenamePayload): Promise<Resume> {
  const response = await apiClient.patch<ApiResponse<Resume>>(`${RESUMES_ROOT}${resumeId}/`, payload);
  const data = response.data.data;

  if (!data) {
    throw new Error("Resume response was empty.");
  }

  return data;
}

export async function deleteResume(resumeId: string): Promise<void> {
  await apiClient.delete(`${RESUMES_ROOT}${resumeId}/`);
}

import { reviewResume as reviewResumeApi } from "@/features/ai-coach/services/ai-coach-service";
import type { ResumeReviewResult } from "@/features/ai-coach/types";

export async function reviewResume(resumeId: string, enhanceWithAi: boolean = false): Promise<ResumeReviewResult> {
  return reviewResumeApi({ resumeId, enhanceWithAi });
}


export async function applyResumeSuggestion(resumeId: string, suggestion: { section_key?: string; original_text: string; suggested_text: string }): Promise<Resume> {
  const response = await apiClient.post<ApiResponse<Resume>>(`${RESUMES_ROOT}${resumeId}/apply-suggestion/`, suggestion);
  const data = response.data.data;
  if (!data) {
    throw new Error("Apply suggestion response was empty.");
  }
  return data;
}

export async function fetchResumeVersions(resumeId: string): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(`${RESUMES_ROOT}${resumeId}/versions/`);
  return response.data.data ?? [];
}

export async function createResumeVersion(resumeId: string, payload: { title: string; commit_message?: string; tags?: string[] }): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(`${RESUMES_ROOT}${resumeId}/versions/`, payload);
  return response.data.data;
}

export async function restoreResumeVersion(resumeId: string, versionId: string): Promise<Resume> {
  const response = await apiClient.post<ApiResponse<Resume>>(`${RESUMES_ROOT}${resumeId}/versions/${versionId}/restore/`);
  const data = response.data.data;
  if (!data) {
    throw new Error("Restore version response was empty.");
  }
  return data;
}


