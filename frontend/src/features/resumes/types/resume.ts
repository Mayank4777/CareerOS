export type ResumeStatus = "draft" | "in_review" | "approved" | "applied" | "archived";

export interface MissingProfileInfo {
  field: string;
  label: string;
  section: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
}

export interface ResumeContentData {
  personal_info?: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  target_role?: string;
  job_description?: string;
  sections?: Array<{
    key: string;
    title: string;
    visible: boolean;
    items: Array<Record<string, any>>;
  }>;
  missing_info?: MissingProfileInfo[];
}

export interface Resume {
  id: string;
  title: string;
  target_role?: string;
  job_description?: string;
  template: string;
  status: ResumeStatus;
  content_data?: ResumeContentData;
  created_at: string;
  updated_at: string;
}

export interface ResumePayload {
  title: string;
  template: string;
  status: ResumeStatus;
  target_role?: string;
  job_description?: string;
  content_data?: ResumeContentData;
}

export interface ResumeGeneratePayload {
  title: string;
  target_role?: string;
  job_description?: string;
  template?: string;
}

export interface ResumeRenamePayload {
  title: string;
}

export interface ResumeFormValues {
  title: string;
  template: string;
  status: ResumeStatus;
}

export interface ResumeRenameFormValues {
  title: string;
}


