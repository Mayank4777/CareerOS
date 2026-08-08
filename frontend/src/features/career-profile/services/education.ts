import axios from "axios";

import { EDUCATION_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type {
  Education,
  EducationFormValues,
  EducationApiPayload,
} from "@/features/career-profile/types/education";

type EducationApiRecord = Record<string, unknown> & {
  id?: unknown;
  user?: unknown;
  institution?: unknown;
  degree?: unknown;
  field_of_study?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  grade?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export async function fetchEducations(): Promise<Education[]> {
  const response = await apiClient.get<ApiResponse<EducationApiRecord[]>>(EDUCATION_ROUTES.root);
  return normalizeEducationList(response.data.data ?? []);
}

export async function createEducation(payload: EducationFormValues): Promise<Education> {
  const response = await apiClient.post<ApiResponse<EducationApiRecord>>(EDUCATION_ROUTES.root, toApiPayload(payload));
  return normalizeEducation(response.data.data);
}

export async function updateEducation({
  educationId,
  payload,
}: {
  educationId: string;
  payload: EducationFormValues;
}): Promise<Education> {
  const response = await apiClient.patch<ApiResponse<EducationApiRecord>>(
    EDUCATION_ROUTES.detail(educationId),
    toApiPayload(payload)
  );
  return normalizeEducation(response.data.data);
}

export async function deleteEducation(educationId: string): Promise<void> {
  await apiClient.delete(EDUCATION_ROUTES.detail(educationId));
}

function toApiPayload(payload: EducationFormValues): EducationApiPayload {
  return {
    institution: payload.institution,
    degree: payload.degree,
    field_of_study: payload.fieldOfStudy,
    start_date: payload.startDate,
    end_date: payload.endDate,
    grade: payload.grade,
  };
}

function normalizeEducationList(records: EducationApiRecord[]): Education[] {
  return [...records]
    .map((record) => normalizeEducation(record))
    .sort((left, right) => compareEducation(right, left));
}

function normalizeEducation(record: EducationApiRecord | undefined): Education {
  if (!record) {
    throw new Error("Education response was empty.");
  }

  return {
    id: readString(record, "id"),
    user: readString(record, "user"),
    institution: readString(record, "institution"),
    degree: readString(record, "degree"),
    fieldOfStudy: readString(record, "field_of_study", "fieldOfStudy"),
    startDate: readString(record, "start_date", "startDate"),
    endDate: readString(record, "end_date", "endDate"),
    grade: readString(record, "grade"),
    createdAt: readString(record, "created_at", "createdAt"),
    updatedAt: readString(record, "updated_at", "updatedAt"),
  };
}

function compareEducation(left: Education, right: Education) {
  return (
    stringToTimestamp(left.endDate) - stringToTimestamp(right.endDate) ||
    stringToTimestamp(left.startDate) - stringToTimestamp(right.startDate) ||
    left.institution.localeCompare(right.institution)
  );
}

function stringToTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}
