import { APPLICATIONS_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { Application, ApplicationFormValues } from "../types";

interface ApplicationApiRecord {
  id: string;
  resume?: string | null;
  company: string;
  position: string;
  status: string;
  applied_at?: string | null;
  location?: string;
  salary?: string;
  job_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

function normalizeApplication(record: ApplicationApiRecord | undefined): Application {
  if (!record) {
    throw new Error("Application record was undefined");
  }

  return {
    id: record.id ?? "",
    resume: record.resume ?? null,
    company: record.company ?? "",
    position: record.position ?? "",
    status: (record.status as Application["status"]) || "applied",
    appliedAt: record.applied_at ?? null,
    location: record.location ?? "",
    salary: record.salary ?? "",
    jobUrl: record.job_url ?? "",
    notes: record.notes ?? "",
    createdAt: record.created_at ?? "",
    updatedAt: record.updated_at ?? "",
  };
}

export async function fetchApplications(params?: { search?: string; status?: string }): Promise<Application[]> {
  const response = await apiClient.get<ApiResponse<ApplicationApiRecord[]>>(APPLICATIONS_ROUTES.root, { params });
  return (response.data.data ?? []).map(normalizeApplication);
}

export async function createApplication(payload: ApplicationFormValues): Promise<Application> {
  const response = await apiClient.post<ApiResponse<ApplicationApiRecord>>(APPLICATIONS_ROUTES.root, {
    resume: payload.resume || null,
    company: payload.company,
    position: payload.position,
    status: payload.status ?? "applied",
    applied_at: payload.appliedAt || null,
    location: payload.location,
    salary: payload.salary,
    job_url: payload.jobUrl,
    notes: payload.notes,
  });
  return normalizeApplication(response.data.data);
}

export async function updateApplication({
  applicationId,
  payload,
}: {
  applicationId: string;
  payload: Partial<ApplicationFormValues>;
}): Promise<Application> {
  const response = await apiClient.patch<ApiResponse<ApplicationApiRecord>>(
    APPLICATIONS_ROUTES.detail(applicationId),
    {
      resume: payload.resume,
      company: payload.company,
      position: payload.position,
      status: payload.status,
      applied_at: payload.appliedAt,
      location: payload.location,
      salary: payload.salary,
      job_url: payload.jobUrl,
      notes: payload.notes,
    }
  );
  return normalizeApplication(response.data.data);
}

export async function deleteApplication(applicationId: string): Promise<void> {
  await apiClient.delete(APPLICATIONS_ROUTES.detail(applicationId));
}
