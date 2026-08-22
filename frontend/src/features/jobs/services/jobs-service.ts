import { JOBS_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { SavedJob, SavedJobFormValues } from "../types";

interface SavedJobApiRecord {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  source?: string;
  url?: string;
  status: string;
  description?: string;
  saved_at: string;
  updated_at: string;
}

function normalizeSavedJob(record: SavedJobApiRecord | undefined): SavedJob {
  if (!record) {
    throw new Error("Saved job record was undefined");
  }

  return {
    id: record.id ?? "",
    title: record.title ?? "",
    company: record.company ?? "",
    location: record.location ?? "",
    salaryRange: record.salary_range ?? "",
    source: record.source ?? "",
    url: record.url ?? "",
    status: (record.status as SavedJob["status"]) || "saved",
    description: record.description ?? "",
    savedAt: record.saved_at ?? "",
    updatedAt: record.updated_at ?? "",
  };
}

export async function fetchSavedJobs(params?: { search?: string; status?: string }): Promise<SavedJob[]> {
  const response = await apiClient.get<ApiResponse<SavedJobApiRecord[]>>(JOBS_ROUTES.saved, { params });
  return (response.data.data ?? []).map(normalizeSavedJob);
}

export async function createSavedJob(payload: SavedJobFormValues): Promise<SavedJob> {
  const response = await apiClient.post<ApiResponse<SavedJobApiRecord>>(JOBS_ROUTES.saved, {
    title: payload.title,
    company: payload.company,
    location: payload.location,
    salary_range: payload.salaryRange,
    source: payload.source,
    url: payload.url,
    status: payload.status ?? "saved",
    description: payload.description,
  });
  return normalizeSavedJob(response.data.data);
}

export async function updateSavedJob({
  jobId,
  payload,
}: {
  jobId: string;
  payload: Partial<SavedJobFormValues>;
}): Promise<SavedJob> {
  const response = await apiClient.patch<ApiResponse<SavedJobApiRecord>>(JOBS_ROUTES.savedDetail(jobId), {
    title: payload.title,
    company: payload.company,
    location: payload.location,
    salary_range: payload.salaryRange,
    source: payload.source,
    url: payload.url,
    status: payload.status,
    description: payload.description,
  });
  return normalizeSavedJob(response.data.data);
}

export async function deleteSavedJob(jobId: string): Promise<void> {
  await apiClient.delete(JOBS_ROUTES.savedDetail(jobId));
}
