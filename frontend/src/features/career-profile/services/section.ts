import axios from "axios";

import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { SectionFieldConfig, SectionFormValues, SectionRecord } from "@/features/career-profile/types/section";
import { normalizeChoiceValue } from "@/features/career-profile/utils/section-choice";

interface SectionServiceConfig {
  apiRoot: string;
  fields: SectionFieldConfig[];
}

export function createSectionService<TRecord extends SectionRecord>(config: SectionServiceConfig) {
  const root = normalizeRoot(config.apiRoot);

  return {
    async fetchRecords(): Promise<TRecord[]> {
      const response = await apiClient.get<ApiResponse<TRecord[]>>(root);
      return response.data.data ?? [];
    },

    async createRecord(payload: SectionFormValues): Promise<TRecord> {
      const response = await apiClient.post<ApiResponse<TRecord>>(root, toApiPayload(config.fields, payload));
      return readResponseData(response.data.data);
    },

    async updateRecord(recordId: string, payload: SectionFormValues): Promise<TRecord> {
      const response = await apiClient.patch<ApiResponse<TRecord>>(
        `${root}${recordId}/`,
        toApiPayload(config.fields, payload)
      );
      return readResponseData(response.data.data);
    },

    async deleteRecord(recordId: string): Promise<void> {
      await apiClient.delete(`${root}${recordId}/`);
    },
  };
}

function normalizeRoot(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function readResponseData<TRecord>(data: TRecord | undefined): TRecord {
  if (!data) {
    throw new Error("Section response was empty.");
  }

  return data;
}

function toApiPayload(fields: SectionFieldConfig[], values: SectionFormValues) {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const value = values[field.name];

    if (field.kind === "checkbox") {
      payload[field.name] = Boolean(value);
      continue;
    }

    if (field.kind === "combobox") {
      payload[field.name] = normalizeChoiceValue(value, field.options, Boolean(field.allowCustom));
      continue;
    }

    if (field.kind === "number") {
      if (value === "" || value === null || value === undefined) {
        continue;
      }

      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isNaN(numericValue)) {
        payload[field.name] = numericValue;
      }
      continue;
    }

    if (field.kind === "date") {
      payload[field.name] = typeof value === "string" && value.trim() ? value : null;
      continue;
    }

    if (typeof value === "string") {
      payload[field.name] = value.trim();
      continue;
    }

    if (value !== undefined && value !== null) {
      payload[field.name] = value;
    }
  }

  return payload;
}
