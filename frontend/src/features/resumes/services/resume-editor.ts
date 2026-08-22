import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";

import type {
  ResumeEditorSection,
  ResumeEditorSectionFormValues,
  ResumeEditorSectionItem,
  ResumeEditorSectionItemFormValues,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";

const RESUME_EDITOR_ROOT = "/resume-editor/";

export async function fetchResumeEditorSections(resumeId: string): Promise<ResumeEditorSection[]> {
  const response = await apiClient.get<ApiResponse<ResumeEditorSection[]>>(`${RESUME_EDITOR_ROOT}${resumeId}/sections/`);
  return response.data.data ?? [];
}

export async function createResumeEditorSection(
  resumeId: string,
  payload: ResumeEditorSectionFormValues & { sectionType: ResumeEditorSectionType; displayOrder: number }
): Promise<ResumeEditorSection> {
  const response = await apiClient.post<ApiResponse<ResumeEditorSection>>(`${RESUME_EDITOR_ROOT}${resumeId}/sections/`, {
    section_type: payload.sectionType,
    title: payload.title,
    display_order: payload.displayOrder,
    is_visible: payload.isVisible,
  });
  return readResponseData(response.data.data);
}

export async function updateResumeEditorSection(
  sectionId: string,
  payload: Partial<ResumeEditorSectionFormValues> & { displayOrder?: number }
): Promise<ResumeEditorSection> {
  const response = await apiClient.patch<ApiResponse<ResumeEditorSection>>(`${RESUME_EDITOR_ROOT}sections/${sectionId}/`, {
    title: payload.title,
    display_order: payload.displayOrder,
    is_visible: payload.isVisible,
  });
  return readResponseData(response.data.data);
}

export async function deleteResumeEditorSection(sectionId: string): Promise<void> {
  await apiClient.delete(`${RESUME_EDITOR_ROOT}sections/${sectionId}/`);
}

export async function fetchResumeEditorSectionItems(sectionId: string): Promise<ResumeEditorSectionItem[]> {
  const response = await apiClient.get<ApiResponse<ResumeEditorSectionItem[]>>(
    `${RESUME_EDITOR_ROOT}sections/${sectionId}/items/`
  );
  return response.data.data ?? [];
}

export async function createResumeEditorSectionItem(
  sectionId: string,
  payload: ResumeEditorSectionItemFormValues
): Promise<ResumeEditorSectionItem> {
  const response = await apiClient.post<ApiResponse<ResumeEditorSectionItem>>(
    `${RESUME_EDITOR_ROOT}sections/${sectionId}/items/`,
    {
      source_object_id: payload.sourceObjectId,
      display_order: payload.displayOrder,
    }
  );
  return readResponseData(response.data.data);
}

export async function updateResumeEditorSectionItem(
  itemId: string,
  payload: Partial<ResumeEditorSectionItemFormValues>
): Promise<ResumeEditorSectionItem> {
  const response = await apiClient.patch<ApiResponse<ResumeEditorSectionItem>>(`${RESUME_EDITOR_ROOT}items/${itemId}/`, {
    display_order: payload.displayOrder,
  });
  return readResponseData(response.data.data);
}

export async function deleteResumeEditorSectionItem(itemId: string): Promise<void> {
  await apiClient.delete(`${RESUME_EDITOR_ROOT}items/${itemId}/`);
}

export async function fetchResumeEditorSourceRecords(
  sectionType: ResumeEditorSectionType
): Promise<ResumeEditorSourceRecord[]> {
  switch (sectionType) {
    case "personal_information":
      return fetchPersonalInformationSource();
    case "education":
      return fetchListSource("/education/", normalizeEducationRecord);
    case "experience":
      return fetchListSource("/experience/", normalizeExperienceRecord);
    case "skills":
      return fetchListSource("/skills/", normalizeSkillRecord);
    case "projects":
      return fetchListSource("/projects/", normalizeProjectRecord);
    case "certifications":
      return fetchListSource("/certifications/", normalizeCertificationRecord);
    case "languages":
      return fetchListSource("/languages/", normalizeLanguageRecord);
    case "achievements":
      return fetchListSource("/achievements/", normalizeAchievementRecord);
    case "awards":
      return fetchListSource("/awards/", normalizeAwardRecord);
    case "volunteer":
      return fetchListSource("/volunteer-experience/", normalizeVolunteerRecord);
    case "publications":
      return fetchListSource("/publications/", normalizePublicationRecord);
    case "interests":
      return fetchListSource("/interests/", normalizeInterestRecord);
    case "references":
      return fetchListSource("/references/", normalizeReferenceRecord);
    case "custom_sections":
      return fetchListSource("/custom-sections/", normalizeCustomSectionRecord);
    default:
      return [];
  }
}

async function fetchPersonalInformationSource(): Promise<ResumeEditorSourceRecord[]> {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>("/profile/");
  const record = response.data.data;
  if (!record) {
    return [];
  }

  return [normalizePersonalInformationRecord(record)];
}

async function fetchListSource(
  root: string,
  normalizer: (record: Record<string, unknown>) => ResumeEditorSourceRecord
): Promise<ResumeEditorSourceRecord[]> {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(root);
  return (response.data.data ?? []).map((record) => normalizer(record));
}

function normalizePersonalInformationRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const firstName = readString(record, "first_name", "firstName");
  const lastName = readString(record, "last_name", "lastName");
  const headline = readString(record, "headline");
  const summary = readString(record, "summary", "about_me");

  return buildRecord({
    id: readString(record, "id"),
    title: [firstName, lastName].filter(Boolean).join(" ").trim() || "Personal Information",
    subtitle: headline,
    description: summary,
    meta: compactStrings([
      readString(record, "location"),
      readString(record, "phone", "phone_number"),
      readString(record, "website", "website_url"),
    ]),
    searchTerms: [firstName, lastName, headline, summary],
  });
}

function normalizeEducationRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const institution = readString(record, "institution");
  const degree = readString(record, "degree");
  const fieldOfStudy = readString(record, "field_of_study", "fieldOfStudy");

  return buildRecord({
    id: readString(record, "id"),
    title: institution || degree || fieldOfStudy || "Education",
    subtitle: compactStrings([degree, fieldOfStudy]).join(" • "),
    description: readString(record, "institution") && (degree || fieldOfStudy)
      ? undefined
      : compactStrings([readString(record, "start_date", "startDate"), readString(record, "end_date", "endDate"), readString(record, "grade")]).join(" • "),
    meta: compactStrings([readString(record, "start_date", "startDate"), readString(record, "end_date", "endDate"), readString(record, "grade")]),
    searchTerms: [institution, degree, fieldOfStudy],
  });
}

function normalizeExperienceRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const designation = readString(record, "designation");
  const company = readString(record, "company");
  const location = readString(record, "location");
  const employmentType = readString(record, "employment_type");

  return buildRecord({
    id: readString(record, "id"),
    title: [designation, company].filter(Boolean).join(" @ ") || designation || company || "Experience",
    subtitle: compactStrings([location, employmentType]).join(" • "),
    description: readString(record, "description"),
    meta: compactStrings([location, employmentType, readString(record, "start_date", "startDate"), readString(record, "end_date", "endDate")]),
    searchTerms: [designation, company, readString(record, "description")],
  });
}

function normalizeSkillRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const skillName = readString(record, "name");
  const proficiency = readString(record, "proficiency_level", "proficiencyLevel");
  const category = readString(record, "category");

  return buildRecord({
    id: readString(record, "id"),
    title: skillName || category || "Skill",
    subtitle: proficiency,
    description: category,
    meta: compactStrings([readString(record, "years_of_experience", "yearsOfExperience")]),
    searchTerms: [skillName, category, proficiency],
  });
}

function normalizeProjectRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const title = readString(record, "title");
  const organization = readString(record, "organization");
  const role = readString(record, "role");

  return buildRecord({
    id: readString(record, "id"),
    title: title || organization || "Project",
    subtitle: compactStrings([organization, role]).join(" • "),
    description: readString(record, "description"),
    meta: compactStrings([readString(record, "role"), readString(record, "technologies"), readString(record, "project_url"), readString(record, "github_url")]),
    searchTerms: [title, organization, role, readString(record, "description")],
  });
}

function normalizeCertificationRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const name = readString(record, "name");
  const issuingOrganization = readString(record, "issuing_organization", "issuingOrganization");

  return buildRecord({
    id: readString(record, "id"),
    title: name || issuingOrganization || "Certification",
    subtitle: issuingOrganization,
    description: readString(record, "credential_id", "credentialId"),
    meta: compactStrings([readString(record, "issue_date", "issueDate"), readString(record, "expiry_date", "expiryDate"), readString(record, "credential_url", "credentialUrl")]),
    searchTerms: [name, issuingOrganization, readString(record, "credential_id", "credentialId")],
  });
}

function normalizeLanguageRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const language = readString(record, "language");
  const proficiency = readString(record, "proficiency");

  return buildRecord({
    id: readString(record, "id"),
    title: language || "Language",
    subtitle: proficiency,
    searchTerms: [language, proficiency],
  });
}

function normalizeAchievementRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const title = readString(record, "title");
  const description = readString(record, "description");

  return buildRecord({
    id: readString(record, "id"),
    title: title || description || "Achievement",
    description,
    meta: compactStrings([readString(record, "achievement_date", "achievementDate")]),
    searchTerms: [title, description],
  });
}

function normalizeAwardRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const title = readString(record, "title");
  const issuer = readString(record, "issuer");

  return buildRecord({
    id: readString(record, "id"),
    title: title || issuer || "Award",
    subtitle: issuer,
    description: readString(record, "description"),
    meta: compactStrings([readString(record, "award_date", "awardDate")]),
    searchTerms: [title, issuer, readString(record, "description")],
  });
}

function normalizeVolunteerRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const organization = readString(record, "organization");
  const role = readString(record, "role");

  return buildRecord({
    id: readString(record, "id"),
    title: [role, organization].filter(Boolean).join(" @ ") || role || organization || "Volunteer",
    subtitle: readString(record, "description"),
    description: readString(record, "description"),
    meta: compactStrings([readString(record, "start_date", "startDate"), readString(record, "end_date", "endDate")]),
    searchTerms: [organization, role, readString(record, "description")],
  });
}

function normalizePublicationRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const title = readString(record, "title");
  const publisher = readString(record, "publisher");

  return buildRecord({
    id: readString(record, "id"),
    title: title || publisher || "Publication",
    subtitle: publisher,
    description: readString(record, "description"),
    meta: compactStrings([readString(record, "publication_date", "publicationDate"), readString(record, "publication_url", "publicationUrl")]),
    searchTerms: [title, publisher, readString(record, "description")],
  });
}

function normalizeInterestRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const name = readString(record, "name");

  return buildRecord({
    id: readString(record, "id"),
    title: name || "Interest",
    searchTerms: [name],
  });
}

function normalizeReferenceRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const name = readString(record, "name");
  const designation = readString(record, "designation");
  const company = readString(record, "company");

  return buildRecord({
    id: readString(record, "id"),
    title: name || designation || company || "Reference",
    subtitle: designation,
    description: company,
    meta: compactStrings([readString(record, "email"), readString(record, "phone"), readString(record, "relationship")]),
    searchTerms: [name, designation, company],
  });
}

function normalizeCustomSectionRecord(record: Record<string, unknown>): ResumeEditorSourceRecord {
  const title = readString(record, "title");

  return buildRecord({
    id: readString(record, "id"),
    title: title || "Custom section",
    description: readString(record, "content"),
    meta: compactStrings([readString(record, "display_order", "displayOrder")]),
    searchTerms: [title, readString(record, "content")],
  });
}

function buildRecord({
  id,
  title,
  subtitle,
  description,
  meta,
  searchTerms,
}: {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  meta?: string[];
  searchTerms: string[];
}): ResumeEditorSourceRecord {
  return {
    id,
    title,
    subtitle,
    description,
    meta,
    searchText: [title, subtitle, description, ...(meta ?? []), ...searchTerms].filter(Boolean).join(" ").toLowerCase(),
  };
}

function readResponseData<TRecord>(data: TRecord | undefined): TRecord {
  if (!data) {
    throw new Error("Resume editor response was empty.");
  }

  return data;
}

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return "";
}

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim()));
}
