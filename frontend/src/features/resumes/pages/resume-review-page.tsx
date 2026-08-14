import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FilePlus,
  FileText,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { useResumes, useReviewResume } from "../hooks/use-resumes";
import type { ResumeReviewResult } from "@/features/ai-coach/types";

function getScoreTier(score: number) {
  if (score >= 80) {
    return {
      label: "Strong",
      tone: "success" as const,
      icon: CheckCircle2,
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
    };
  }
  if (score >= 60) {
    return {
      label: "Good",
      tone: "info" as const,
      icon: Sparkles,
      colorClass: "text-brand-400",
      bgClass: "bg-brand-500/10 border-brand-500/20",
    };
  }
  if (score >= 40) {
    return {
      label: "Needs Improvement",
      tone: "warning" as const,
      icon: AlertTriangle,
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
    };
  }
  return {
    label: "Significant Improvement Needed",
    tone: "danger" as const,
    icon: XCircle,
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10 border-rose-500/20",
  };
}

export function ResumeReviewPage() {
  const navigate = useNavigate();
  const resumesQuery = useResumes();
  const resumes = resumesQuery.data ?? [];

  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [result, setResult] = useState<ResumeReviewResult | null>(null);

  const reviewMutation = useReviewResume(selectedResumeId);

  // Default to first resume when resumes load
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // When user changes dropdown selection, clear previous review result to prevent displaying stale results
  const handleSelectResume = (newResumeId: string) => {
    setSelectedResumeId(newResumeId);
    setResult(null);
    reviewMutation.reset();
  };

  const handleReview = () => {
    if (!selectedResumeId || reviewMutation.isPending) return;
    reviewMutation.mutate(undefined, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  // Initial loading of resumes library
  if (resumesQuery.isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
        <PageHeader
          title="Resume Review"
          description="Contextual AI review of your resume evaluated against your CareerOS professional profile."
        />
        <LoadingState label="Loading your resume library..." />
      </div>
    );
  }

  // Resumes query error
  if (resumesQuery.isError) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
        <PageHeader
          title="Resume Review"
          description="Contextual AI review of your resume evaluated against your CareerOS professional profile."
        />
        <ErrorState
          title="Unable to load resumes"
          description={resumesQuery.error?.message || "Failed to fetch resume library."}
          onRetry={() => void resumesQuery.refetch()}
        />
      </div>
    );
  }

  // Empty state: User has no resumes created
  if (resumes.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
        <PageHeader
          title="Resume Review"
          description="Contextual AI review of your resume evaluated against your CareerOS professional profile."
        />
        <EmptyState
          title="No Resumes Available"
          description="You need to create a resume first before requesting an AI review. Build a resume from your Career Profile to get started."
          actionLabel="Create Resume"
          onAction={() => navigate("/resumes/editor")}
          icon={<FilePlus className="h-10 w-10 text-brand-500" />}
        />
      </div>
    );
  }

  const scoreTier = result ? getScoreTier(result.score) : null;
  const TierIcon = scoreTier ? scoreTier.icon : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      <PageHeader
        title="Resume Review"
        description="Contextual AI review of your resume evaluated against your CareerOS professional profile."
      />

      {/* 1. Resume Selection & Review Action Bar */}
      <Card className="p-5 border-border/80 bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 w-full sm:max-w-md">
            <label htmlFor="resume-select" className="text-xs font-semibold text-primary block">
              Select Resume for Review
            </label>
            <select
              id="resume-select"
              value={selectedResumeId}
              onChange={(e) => handleSelectResume(e.target.value)}
              disabled={reviewMutation.isPending}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} {r.target_role ? `(${r.target_role})` : ""}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="md"
            onClick={handleReview}
            disabled={!selectedResumeId || reviewMutation.isPending}
            aria-busy={reviewMutation.isPending}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 mt-2 sm:mt-5"
          >
            <Sparkles className={`w-4 h-4 ${reviewMutation.isPending ? "animate-spin" : ""}`} />
            {reviewMutation.isPending ? "Reviewing..." : "Review Resume"}
          </Button>
        </div>
      </Card>

      {/* 6. Pending Review Loading State */}
      {reviewMutation.isPending && (
        <LoadingState label="CareerOS is reviewing your resume against your career profile..." />
      )}

      {/* 8. Error State */}
      {reviewMutation.isError && !reviewMutation.isPending && (
        <ErrorState
          title="Resume Review Failed"
          description={
            reviewMutation.error?.message ||
            "An error occurred while evaluating your resume. Please try again."
          }
          onRetry={handleReview}
        />
      )}

      {/* 7. Initial Empty State (Before Review Run) */}
      {!result && !reviewMutation.isPending && !reviewMutation.isError && (
        <EmptyState
          title="Ready for Review"
          description="Select a resume above and click 'Review Resume' to generate structured AI feedback, score analysis, strengths, weaknesses, and actionable recommendations."
          icon={<FileText className="h-10 w-10 text-brand-500" />}
        />
      )}

      {/* Review Results Presentation */}
      {result && !reviewMutation.isPending && (
        <div className="space-y-8">
          {/* 5. Contextual Banner & 3. Score Presentation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Prominent Score Card */}
            <Card className="p-6 md:col-span-1 flex flex-col justify-between items-center text-center border-border bg-card">
              <div className="space-y-1 w-full text-center border-b border-border/60 pb-3">
                <span className="text-[11px] font-semibold tracking-wider text-brand-400 uppercase">
                  Contextual Review Score
                </span>
              </div>

              <div className="my-6 space-y-3 flex flex-col items-center justify-center">
                <div className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
                  {result.score}%
                </div>
                <div className="text-xs font-semibold text-secondary">Resume Score</div>

                {scoreTier && TierIcon && (
                  <Badge tone={scoreTier.tone} className="mt-2 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                    <TierIcon className="w-3.5 h-3.5" />
                    <span>{scoreTier.label}</span>
                  </Badge>
                )}
              </div>

              <p className="text-[11px] text-muted text-center leading-relaxed border-t border-border/60 pt-3">
                Note: Score is an AI-powered estimate based on your CareerOS profile and is not an ATS parsing guarantee.
              </p>
            </Card>

            {/* Contextual Reviewed Resume Information */}
            <Card className="p-6 md:col-span-2 flex flex-col justify-between space-y-4 border-border bg-card">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge tone="info" className="text-[10px] uppercase font-bold tracking-wider">
                    Reviewed Document
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-primary">
                  {selectedResume?.title || "Selected Resume"}
                </h3>
                {selectedResume?.target_role && (
                  <p className="text-xs text-secondary font-medium">
                    Target Role: <strong className="text-primary font-semibold">{selectedResume.target_role}</strong>
                  </p>
                )}
                {selectedResume?.job_description && (
                  <div className="p-3 rounded-lg bg-surface/60 border border-border/60 text-xs text-secondary line-clamp-3">
                    <span className="font-semibold text-primary block mb-1">Target Job Description Snippet:</span>
                    {selectedResume.job_description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted">
                <span>Evaluated: {new Date(result.analyzed_at).toLocaleString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReview}
                  className="text-xs flex items-center gap-1 text-brand-400 hover:text-brand-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-evaluate
                </Button>
              </div>
            </Card>
          </div>

          {/* 4. Three Response Arrays Sections */}
          <div className="space-y-6">
            {/* Section 1: Strengths */}
            <Card className="p-6 space-y-4 border-border bg-card">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-primary">What You&apos;re Doing Well</h3>
                </div>
                <Badge tone="success">{result.strengths.length}</Badge>
              </div>

              {result.strengths.length === 0 ? (
                <p className="text-xs text-secondary py-2 italic">
                  No specific strengths highlighted for this resume.
                </p>
              ) : (
                <ul className="space-y-3">
                  {result.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-secondary leading-relaxed">
                      <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Section 2: Weaknesses */}
            <Card className="p-6 space-y-4 border-border bg-card">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-primary">Areas to Improve</h3>
                </div>
                <Badge tone="warning">{result.weaknesses.length}</Badge>
              </div>

              {result.weaknesses.length === 0 ? (
                <p className="text-xs text-secondary py-2 italic">
                  No specific areas to improve identified.
                </p>
              ) : (
                <ul className="space-y-3">
                  {result.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-secondary leading-relaxed">
                      <span className="p-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Section 3: Recommendations */}
            <Card className="p-6 space-y-4 border-border bg-card">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-primary">Recommended Improvements</h3>
                </div>
                <Badge tone="info">{result.recommendations.length}</Badge>
              </div>

              {result.recommendations.length === 0 ? (
                <p className="text-xs text-secondary py-2 italic">
                  No specific recommendations provided.
                </p>
              ) : (
                <ol className="space-y-3">
                  {result.recommendations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-secondary leading-relaxed p-3 rounded-lg bg-surface/50 border border-border/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
