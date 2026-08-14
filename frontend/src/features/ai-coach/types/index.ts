export interface AIChatResponse {
  feature: string;
  model: string;
  response: string;
  tokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  historyId?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
  error?: boolean;
}

export interface CoverLetterResponse {
  coverLetter: string;
  historyId: string;
}

export interface SkillGapResponse {
  targetRole: string;
  readinessScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface CareerAdviceResponse {
  targetRole: string;
  industry: string;
  actionableInsights: string[];
  recommendedNextSteps: string[];
}

export interface JobMatchResponse {
  id: string;
  jobId: string;
  resumeId: string;
  matchScore: number;
  strengths: string[];
  missingSkills: string[];
  gaps: string[];
  recommendations: string[];
  analyzedAt: string;
}

export interface AIHistoryItem {
  id: string;
  feature: string;
  provider: string;
  model: string;
  totalTokens: number;
  createdAt: string;
}

export type ResumeReviewResult = {
  id: string;
  resume_id: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  analyzed_at: string;
};

export interface MissingSkillItem {
  skill: string;
  importance: "high" | "medium" | "low";
  reason: string;
  recommendation: string;
}

export interface PartialSkillItem {
  skill: string;
  reason: string;
  recommendation: string;
}

export interface SkillGapJobResult {
  id: string;
  job_id: string;
  matched_skills: string[];
  missing_skills: MissingSkillItem[];
  partial_skills: PartialSkillItem[];
  recommendations: string[];
  analyzed_at: string;
}
