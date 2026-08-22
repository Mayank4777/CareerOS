export type InterviewType =
  | "screening"
  | "technical"
  | "behavioral"
  | "system_design"
  | "hr"
  | "final";

export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface Interview {
  id: string;
  application: string;
  companyName?: string;
  positionName?: string;
  round: string;
  interviewType: InterviewType;
  scheduledAt: string;
  status: InterviewStatus;
  locationOrLink?: string;
  interviewerName?: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFormValues {
  application: string;
  round: string;
  interviewType: InterviewType;
  scheduledAt: string;
  status?: InterviewStatus;
  locationOrLink?: string;
  interviewerName?: string;
  notes?: string;
  feedback?: string;
}
