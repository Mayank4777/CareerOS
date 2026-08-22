import axios from "axios";

import { PROFILE_ROUTES } from "@/constants/api";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { CareerProfile } from "@/features/career-profile/types/career-profile";
import type { CareerProfileFormValues } from "@/features/career-profile/validation/career-profile";

type CareerProfileApiRecord = Record<string, unknown> & {
  id?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  headline?: unknown;
  phone?: unknown;
  phone_number?: unknown;
  location?: unknown;
  website?: unknown;
  website_url?: unknown;
  linkedin?: unknown;
  linkedin_url?: unknown;
  github?: unknown;
  github_url?: unknown;
  summary?: unknown;
  about_me?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export async function fetchCareerProfile(): Promise<CareerProfile | null> {
  try {
    const response = await apiClient.get<ApiResponse<CareerProfileApiRecord>>(PROFILE_ROUTES.root);
    return response.data.data ? normalizeCareerProfile(response.data.data) : null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function createCareerProfile(payload: CareerProfileFormValues): Promise<CareerProfile> {
  const response = await apiClient.post<ApiResponse<CareerProfileApiRecord>>(PROFILE_ROUTES.root, toApiPayload(payload));
  return normalizeCareerProfile(response.data.data);
}

export async function updateCareerProfile(payload: CareerProfileFormValues): Promise<CareerProfile> {
  const response = await apiClient.patch<ApiResponse<CareerProfileApiRecord>>(PROFILE_ROUTES.root, toApiPayload(payload));
  return normalizeCareerProfile(response.data.data);
}

export async function deleteCareerProfile(): Promise<void> {
  await apiClient.delete(PROFILE_ROUTES.root);
}

function toApiPayload(payload: CareerProfileFormValues) {
  return {
    first_name: payload.firstName,
    last_name: payload.lastName,
    headline: payload.headline,
    phone: payload.phone,
    location: payload.location,
    website: payload.website,
    linkedin: payload.linkedin,
    github: payload.github,
    summary: payload.summary,
  };
}

function normalizeCareerProfile(data: CareerProfileApiRecord | undefined): CareerProfile {
  if (!data) {
    throw new Error("Career profile response was empty.");
  }

  return {
    id: readString(data, "id"),
    firstName: readString(data, "first_name", "firstName"),
    lastName: readString(data, "last_name", "lastName"),
    headline: readString(data, "headline"),
    phone: readString(data, "phone", "phone_number"),
    location: readString(data, "location"),
    website: readString(data, "website", "website_url"),
    linkedin: readString(data, "linkedin", "linkedin_url"),
    github: readString(data, "github", "github_url"),
    summary: readString(data, "summary", "about_me"),
    createdAt: readString(data, "created_at", "createdAt"),
    updatedAt: readString(data, "updated_at", "updatedAt"),
  };
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
