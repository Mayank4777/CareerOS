import axios from "axios";
import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { Resume } from "@/features/resumes/types/resume";
import type { RawCareerProfileBundle } from "../utils/normalize-career-profile";
import type { ResumeBuilderData } from "../types/resume-builder";

export async function fetchFullCareerProfileBundle(): Promise<RawCareerProfileBundle> {
  const [
    profileRes,
    expRes,
    eduRes,
    skillsRes,
    projRes,
    certRes,
    langRes,
    achRes,
    awardRes,
    volRes,
    pubRes,
  ] = await Promise.allSettled([
    apiClient.get<ApiResponse<Record<string, unknown>>>("/profile/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/experience/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/education/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/skills/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/projects/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/certifications/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/languages/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/achievements/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/awards/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/volunteer-experience/"),
    apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/publications/"),
  ]);

  return {
    profile: getSettledData(profileRes),
    experience: getSettledList(expRes),
    education: getSettledList(eduRes),
    skills: getSettledList(skillsRes),
    projects: getSettledList(projRes),
    certifications: getSettledList(certRes),
    languages: getSettledList(langRes),
    achievements: getSettledList(achRes),
    awards: getSettledList(awardRes),
    volunteer: getSettledList(volRes),
    publications: getSettledList(pubRes),
  };
}

export async function saveResumeBuilderData(
  resumeId: string,
  data: ResumeBuilderData,
  currentResume: Resume
): Promise<Resume> {
  const payload = {
    title: currentResume.title,
    status: currentResume.status,
    template: data.template,
    target_role: data.targetRole,
    job_description: data.jobDescription,
    content_data: {
      personal_info: {
        full_name: data.personal.fullName,
        headline: data.personal.headline,
        email: data.personal.email,
        phone: data.personal.phone,
        location: data.personal.location,
        website: data.personal.website,
        linkedin: data.personal.linkedin,
        github: data.personal.github,
      },
      summary: data.summary,
      target_role: data.targetRole,
      job_description: data.jobDescription,
      experience: data.experience.map((e) => ({
        id: e.id,
        title: e.title,
        company: e.company,
        location: e.location,
        start_date: e.startDate,
        end_date: e.endDate,
        currently_working: e.current,
        description: e.description,
        bullets: e.bullets,
      })),
      education: data.education.map((e) => ({
        id: e.id,
        institution: e.institution,
        degree: e.degree,
        field_of_study: e.fieldOfStudy,
        start_date: e.startDate,
        end_date: e.endDate,
        grade: e.grade,
      })),
      projects: data.projects.map((p) => ({
        id: p.id,
        title: p.title,
        organization: p.organization,
        role: p.role,
        description: p.description,
        technologies: p.technologies,
        url: p.url,
        bullets: p.bullets,
      })),
      skills: data.skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiency_level: s.proficiencyLevel,
      })),
      certifications: data.certifications,
      languages: data.languages,
      achievements: data.achievements,
      awards: data.awards,
      volunteer: data.volunteer,
      publications: data.publications,
    },
  };

  const response = await apiClient.patch<ApiResponse<Resume>>(`/resumes/${resumeId}/`, payload);
  return response.data.data!;
}

export async function requestAIImprovement(prompt: string, feature: string = "career_chat"): Promise<string> {
  const response = await apiClient.post<ApiResponse<{ response: string }>>("/ai-coach/chat/", {
    feature,
    prompt,
  });

  return response.data.data?.response || "Improvement suggestion generated.";
}

function getSettledData<T>(result: PromiseSettledResult<{ data: ApiResponse<T> }>): T | null {
  if (result.status === "fulfilled" && result.value?.data?.data) {
    return result.value.data.data;
  }
  return null;
}

function getSettledList<T>(result: PromiseSettledResult<{ data: ApiResponse<T[]> }>): T[] {
  if (result.status === "fulfilled" && Array.isArray(result.value?.data?.data)) {
    return result.value.data.data;
  }
  return [];
}
