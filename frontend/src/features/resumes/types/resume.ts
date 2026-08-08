export type ResumeStatus = "draft" | "in_review" | "approved" | "applied" | "archived";

export interface Resume {
  id: string;
  title: string;
  template: string;
  status: ResumeStatus;
  created_at: string;
  updated_at: string;
}

export interface ResumePayload {
  title: string;
  template: string;
  status: ResumeStatus;
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

