import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";

import type { Resume, ResumePayload, ResumeRenamePayload } from "@/features/resumes/types/resume";

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

export async function updateResume(resumeId: string, payload: ResumePayload | ResumeRenamePayload): Promise<Resume> {
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

