import { INTERVIEWS_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { Interview, InterviewFormValues } from "../types";

interface InterviewApiRecord {
  id: string;
  application: string;
  company_name?: string;
  position_name?: string;
  round: string;
  interview_type: string;
  scheduled_at: string;
  status: string;
  location_or_link?: string;
  interviewer_name?: string;
  notes?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

function normalizeInterview(record: InterviewApiRecord | undefined): Interview {
  if (!record) {
    throw new Error("Interview record was undefined");
  }

  return {
    id: record.id ?? "",
    application: record.application ?? "",
    companyName: record.company_name ?? "",
    positionName: record.position_name ?? "",
    round: record.round ?? "",
    interviewType: (record.interview_type as Interview["interviewType"]) || "technical",
    scheduledAt: record.scheduled_at ?? "",
    status: (record.status as Interview["status"]) || "scheduled",
    locationOrLink: record.location_or_link ?? "",
    interviewerName: record.interviewer_name ?? "",
    notes: record.notes ?? "",
    feedback: record.feedback ?? "",
    createdAt: record.created_at ?? "",
    updatedAt: record.updated_at ?? "",
  };
}

export async function fetchInterviews(params?: { search?: string; status?: string }): Promise<Interview[]> {
  const response = await apiClient.get<ApiResponse<InterviewApiRecord[]>>(INTERVIEWS_ROUTES.root, { params });
  return (response.data.data ?? []).map(normalizeInterview);
}

export async function createInterview(payload: InterviewFormValues): Promise<Interview> {
  const response = await apiClient.post<ApiResponse<InterviewApiRecord>>(INTERVIEWS_ROUTES.root, {
    application: payload.application,
    round: payload.round,
    interview_type: payload.interviewType,
    scheduled_at: payload.scheduledAt,
    status: payload.status ?? "scheduled",
    location_or_link: payload.locationOrLink,
    interviewer_name: payload.interviewerName,
    notes: payload.notes,
    feedback: payload.feedback,
  });
  return normalizeInterview(response.data.data);
}

export async function updateInterview({
  interviewId,
  payload,
}: {
  interviewId: string;
  payload: Partial<InterviewFormValues>;
}): Promise<Interview> {
  const response = await apiClient.patch<ApiResponse<InterviewApiRecord>>(
    INTERVIEWS_ROUTES.detail(interviewId),
    {
      application: payload.application,
      round: payload.round,
      interview_type: payload.interviewType,
      scheduled_at: payload.scheduledAt,
      status: payload.status,
      location_or_link: payload.locationOrLink,
      interviewer_name: payload.interviewerName,
      notes: payload.notes,
      feedback: payload.feedback,
    }
  );
  return normalizeInterview(response.data.data);
}

export async function deleteInterview(interviewId: string): Promise<void> {
  await apiClient.delete(INTERVIEWS_ROUTES.detail(interviewId));
}
