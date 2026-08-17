export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CareerOS";

export const AUTH_ROUTES = {
  login: "/auth/login/",
  register: "/auth/register/",
  me: "/auth/me/",
  refresh: "/auth/refresh/",
} as const;

export const PROFILE_ROUTES = {
  root: "/profile/",
} as const;

export const EDUCATION_ROUTES = {
  root: "/education/",
  detail: (educationId: string) => `/education/${educationId}/`,
} as const;

export const JOBS_ROUTES = {
  saved: "/saved-jobs/",
  savedDetail: (jobId: string) => `/saved-jobs/${jobId}/`,
  search: "/jobs/search/",
} as const;

export const APPLICATIONS_ROUTES = {
  root: "/applications/",
  detail: (applicationId: string) => `/applications/${applicationId}/`,
} as const;

export const INTERVIEWS_ROUTES = {
  root: "/interviews/",
  detail: (interviewId: string) => `/interviews/${interviewId}/`,
} as const;

export const NOTIFICATIONS_ROUTES = {
  root: "/notifications/",
  read: (id: string) => `/notifications/${id}/read/`,
  readAll: "/notifications/read-all/",
  detail: (id: string) => `/notifications/${id}/`,
} as const;

export const AI_ROUTES = {
  chat: "/ai/chat/",
  coverLetter: "/ai/cover-letter/",
  careerAdvice: "/ai/career-advice/",
  skillGap: "/ai/skill-gap/",
  jobMatch: "/ai/job-match/",
  resumeReview: "/ai/resume-review/",
  history: "/ai/history/",
  roadmapList: "/ai/roadmap/",
  roadmapGenerate: "/ai/roadmap/generate/",
  roadmapDetail: (roadmapId: string) => `/ai/roadmap/${roadmapId}/`,
  roadmapPhases: (roadmapId: string) => `/ai/roadmap/${roadmapId}/phases/`,
  roadmapPhaseDetail: (roadmapId: string, phaseId: string) =>
    `/ai/roadmap/${roadmapId}/phases/${phaseId}/`,
} as const;


export const SETTINGS_ROUTES = {
  root: "/settings/",
} as const;

