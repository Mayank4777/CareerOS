export interface AtsMetric {
  category: string;
  score: number;
  maxScore: number;
  status: "optimal" | "warning" | "critical";
  details: string;
}

export interface GrammarIssue {
  id: string;
  section: string;
  originalText: string;
  suggestedText: string;
  explanation: string;
  issueType: "grammar" | "action_verb" | "formatting" | "readability";
}

export interface SectionAnalysis {
  sectionName: string;
  score: number;
  status: "strong" | "needs_improvement" | "incomplete";
  feedback: string[];
  recommendations: string[];
}

export interface ResumeReviewReport {
  resumeId: string;
  resumeTitle: string;
  overallScore: number;
  grade: "A" | "B+" | "B" | "C" | "D";
  targetRole: string;
  missingKeywords: string[];
  presentKeywords: string[];
  actionVerbsCount: number;
  readabilityScore: string;
  metrics: AtsMetric[];
  sectionAnalyses: SectionAnalysis[];
  issues: GrammarIssue[];
  strengths: string[];
  weaknesses: string[];
}
