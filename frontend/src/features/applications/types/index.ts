export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "accepted";

export interface Application {
  id: string;
  resume?: string | null;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedAt?: string | null;
  location: string;
  salary: string;
  jobUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFormValues {
  resume?: string | null;
  company: string;
  position: string;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  location?: string;
  salary?: string;
  jobUrl?: string;
  notes?: string;
}
