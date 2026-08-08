export type JobStatus = "saved" | "applied" | "archived";

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  source: string;
  url: string;
  status: JobStatus;
  description: string;
  savedAt: string;
  updatedAt: string;
}

export interface SavedJobFormValues {
  title: string;
  company: string;
  location?: string;
  salaryRange?: string;
  source?: string;
  url?: string;
  status?: JobStatus;
  description?: string;
}
