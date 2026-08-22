import type {
  AchievementEntry,
  AwardEntry,
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  PersonalInfo,
  ProjectEntry,
  PublicationEntry,
  ResumeBuilderData,
  SkillItem,
  VolunteerEntry,
} from "../types/resume-builder";

export interface RawCareerProfileBundle {
  profile?: Record<string, unknown> | null;
  experience?: Array<Record<string, unknown>>;
  education?: Array<Record<string, unknown>>;
  skills?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  certifications?: Array<Record<string, unknown>>;
  languages?: Array<Record<string, unknown>>;
  achievements?: Array<Record<string, unknown>>;
  awards?: Array<Record<string, unknown>>;
  volunteer?: Array<Record<string, unknown>>;
  publications?: Array<Record<string, unknown>>;
}

export function buildResumeBuilderDataFromProfile(
  bundle: RawCareerProfileBundle,
  resumeData?: {
    title?: string;
    target_role?: string;
    job_description?: string;
    template?: string;
    content_data?: Record<string, unknown>;
  } | null
): ResumeBuilderData {
  const content = (resumeData?.content_data as Record<string, unknown>) || {};
  const pRecord = bundle.profile || {};

  // 1. Personal Info
  const personalFromContent = (content.personal_info || content.personal) as Record<string, unknown> | undefined;
  const firstName = readStr(personalFromContent, "first_name", "firstName") || readStr(pRecord, "first_name", "firstName");
  const lastName = readStr(personalFromContent, "last_name", "lastName") || readStr(pRecord, "last_name", "lastName");
  const fullName =
    readStr(personalFromContent, "full_name", "fullName") ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    "Professional Candidate";

  const personal: PersonalInfo = {
    fullName,
    headline:
      readStr(personalFromContent, "headline") ||
      readStr(pRecord, "headline") ||
      resumeData?.target_role ||
      "Software Engineer",
    email: readStr(personalFromContent, "email") || readStr(pRecord, "email") || "",
    phone: readStr(personalFromContent, "phone", "phone_number") || readStr(pRecord, "phone", "phone_number") || "",
    location: readStr(personalFromContent, "location") || readStr(pRecord, "location") || "",
    website: readStr(personalFromContent, "website", "website_url") || readStr(pRecord, "website", "website_url") || "",
    linkedin: readStr(personalFromContent, "linkedin", "linkedin_url") || readStr(pRecord, "linkedin", "linkedin_url") || "",
    github: readStr(personalFromContent, "github", "github_url") || readStr(pRecord, "github", "github_url") || "",
  };

  // 2. Summary
  const summary =
    typeof content.summary === "string" && content.summary.trim()
      ? content.summary.trim()
      : readStr(pRecord, "summary", "about_me") ||
        "Results-driven professional with hands-on experience building scalable applications and delivering technical solutions.";

  // 3. Experience
  const expRaw = (Array.isArray(content.experience) ? content.experience : bundle.experience || []) as Array<Record<string, unknown>>;
  const experience: ExperienceEntry[] = expRaw.map((rec, index) => {
    const desc = readStr(rec, "description");
    const rawBullets = Array.isArray(rec.bullets) ? (rec.bullets as string[]) : [];
    const bullets = rawBullets.length > 0 ? rawBullets : splitIntoBullets(desc);

    return {
      id: readStr(rec, "id") || `exp-${index}`,
      title: readStr(rec, "title", "designation", "job_title", "role") || "Technical Role",
      company: readStr(rec, "company", "company_name", "organization") || "Company",
      location: readStr(rec, "location") || "",
      startDate: readStr(rec, "start_date", "startDate") || "2024",
      endDate: readStr(rec, "end_date", "endDate") || "Present",
      current: Boolean(rec.currently_working || rec.is_current || readStr(rec, "end_date")?.toLowerCase() === "present"),
      description: desc,
      bullets,
    };
  });

  // 4. Education
  const eduRaw = (Array.isArray(content.education) ? content.education : bundle.education || []) as Array<Record<string, unknown>>;
  const education: EducationEntry[] = eduRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `edu-${index}`,
    institution: readStr(rec, "institution", "institution_name", "school") || "University",
    degree: readStr(rec, "degree") || "Bachelor of Science",
    fieldOfStudy: readStr(rec, "field_of_study", "fieldOfStudy") || "",
    startDate: readStr(rec, "start_date", "startDate") || "",
    endDate: readStr(rec, "end_date", "endDate") || "",
    grade: readStr(rec, "grade", "gpa") || "",
  }));

  // 5. Projects
  const projRaw = (Array.isArray(content.projects) ? content.projects : bundle.projects || []) as Array<Record<string, unknown>>;
  const projects: ProjectEntry[] = projRaw.map((rec, index) => {
    const desc = readStr(rec, "description");
    const rawBullets = Array.isArray(rec.bullets) ? (rec.bullets as string[]) : [];
    const bullets = rawBullets.length > 0 ? rawBullets : splitIntoBullets(desc);

    return {
      id: readStr(rec, "id") || `proj-${index}`,
      title: readStr(rec, "title", "name") || "Project",
      organization: readStr(rec, "organization", "company") || "",
      role: readStr(rec, "role") || "",
      description: desc,
      technologies: readStr(rec, "technologies", "technologies_used") || "",
      url: readStr(rec, "project_url", "github_url", "url") || "",
      bullets,
    };
  });

  // 6. Skills
  const skillsRaw = (Array.isArray(content.skills) ? content.skills : bundle.skills || []) as Array<Record<string, unknown> | string>;
  const skills: SkillItem[] = skillsRaw
    .map((rec, index) => {
      if (typeof rec === "string") {
        return { id: `skill-${index}`, name: rec.trim(), category: "Core Technical Skills" };
      }
      const name = readStr(rec, "name", "title", "skill");
      if (!name) return null;
      return {
        id: readStr(rec, "id") || `skill-${index}`,
        name,
        category: readStr(rec, "category") || "Core Technical Skills",
        proficiencyLevel: readStr(rec, "proficiency_level", "proficiencyLevel"),
      };
    })
    .filter((item): item is SkillItem => item !== null);

  // 7. Certifications
  const certRaw = (Array.isArray(content.certifications) ? content.certifications : bundle.certifications || []) as Array<Record<string, unknown>>;
  const certifications: CertificationEntry[] = certRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `cert-${index}`,
    name: readStr(rec, "name", "title") || "Certification",
    organization: readStr(rec, "issuing_organization", "organization", "issuer") || "",
    issueDate: readStr(rec, "issue_date", "issueDate") || "",
    credentialId: readStr(rec, "credential_id", "credentialId") || "",
  }));

  // 8. Languages
  const langRaw = (Array.isArray(content.languages) ? content.languages : bundle.languages || []) as Array<Record<string, unknown>>;
  const languages: LanguageEntry[] = langRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `lang-${index}`,
    language: readStr(rec, "language", "name") || "English",
    proficiency: readStr(rec, "proficiency", "proficiency_level") || "Fluent",
  }));

  // 9. Achievements
  const achRaw = (Array.isArray(content.achievements) ? content.achievements : bundle.achievements || []) as Array<Record<string, unknown>>;
  const achievements: AchievementEntry[] = achRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `ach-${index}`,
    title: readStr(rec, "title", "name") || "Achievement",
    description: readStr(rec, "description") || "",
    date: readStr(rec, "achievement_date", "date") || "",
  }));

  // 10. Awards
  const awardRaw = (Array.isArray(content.awards) ? content.awards : bundle.awards || []) as Array<Record<string, unknown>>;
  const awards: AwardEntry[] = awardRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `award-${index}`,
    title: readStr(rec, "title") || "Award",
    issuer: readStr(rec, "issuer", "organization") || "",
    description: readStr(rec, "description") || "",
    date: readStr(rec, "award_date", "date") || "",
  }));

  // 11. Volunteer
  const volRaw = (Array.isArray(content.volunteer) ? content.volunteer : bundle.volunteer || []) as Array<Record<string, unknown>>;
  const volunteer: VolunteerEntry[] = volRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `vol-${index}`,
    role: readStr(rec, "role", "title") || "Volunteer",
    organization: readStr(rec, "organization") || "",
    description: readStr(rec, "description") || "",
    startDate: readStr(rec, "start_date", "startDate") || "",
    endDate: readStr(rec, "end_date", "endDate") || "",
  }));

  // 12. Publications
  const pubRaw = (Array.isArray(content.publications) ? content.publications : bundle.publications || []) as Array<Record<string, unknown>>;
  const publications: PublicationEntry[] = pubRaw.map((rec, index) => ({
    id: readStr(rec, "id") || `pub-${index}`,
    title: readStr(rec, "title") || "Publication",
    publisher: readStr(rec, "publisher") || "",
    description: readStr(rec, "description") || "",
    date: readStr(rec, "publication_date", "date") || "",
  }));

  return {
    personal,
    summary,
    targetRole: (resumeData?.target_role || readStr(content, "target_role") || personal.headline || "Software Engineer").trim(),
    jobDescription: (resumeData?.job_description || readStr(content, "job_description") || "").trim(),
    template: resumeData?.template || readStr(content, "template") || "modern",
    experience,
    education,
    projects,
    skills,
    certifications,
    languages,
    achievements,
    awards,
    volunteer,
    publications,
  };
}

function readStr(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!record) return "";
  for (const key of keys) {
    const val = record[key];
    if (typeof val === "string" && val.trim()) {
      return val.trim();
    }
    if (typeof val === "number" || typeof val === "boolean") {
      return String(val);
    }
  }
  return "";
}

function splitIntoBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n|•|-/)
    .map((b) => b.trim())
    .filter((b) => b.length > 5);
}
