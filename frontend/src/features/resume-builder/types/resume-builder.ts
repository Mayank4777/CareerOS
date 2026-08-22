export type AlertLevel = "RED" | "AMBER" | "GREEN";

export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  organization: string;
  role: string;
  description: string;
  technologies: string;
  url: string;
  bullets: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiencyLevel?: string;
}

export interface SkillCategoryGroup {
  category: string;
  skills: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  description: string;
  date?: string;
}

export interface VolunteerEntry {
  id: string;
  role: string;
  organization: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  description: string;
  date?: string;
}

export interface ResumeBuilderData {
  personal: PersonalInfo;
  summary: string;
  targetRole: string;
  jobDescription: string;
  template: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: SkillItem[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  achievements: AchievementEntry[];
  awards: AwardEntry[];
  volunteer: VolunteerEntry[];
  publications: PublicationEntry[];
}

export interface ImprovementIssue {
  id: string;
  message: string;
  severity: "critical" | "medium" | "low";
  field?: string;
  suggestion?: string;
}

export interface SectionImprovement {
  sectionKey: string;
  title: string;
  level: AlertLevel;
  issues: ImprovementIssue[];
  aiSuggestion?: {
    originalText: string;
    suggestedText: string;
    reason: string;
  };
}

export interface AISuggestion {
  id: string;
  sectionKey: string;
  itemTitle?: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  severity: "critical" | "medium" | "low";
  state: "pending" | "accepted" | "rejected";
}

export interface OverallImprovementReport {
  score: number;
  criticalCount: number;
  recommendedCount: number;
  strongCount: number;
  sections: SectionImprovement[];
  suggestions: AISuggestion[];
}
