import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Briefcase,
  HelpCircle,
  XCircle,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useGetJobMatch } from "../hooks/use-ai-coach";
import { useSavedJobs } from "@/features/jobs/hooks/use-jobs";
import { useResumes } from "@/features/resumes/hooks/use-resumes";
import { useToast } from "@/components/ui/toast";
import { APP_ROUTES } from "@/constants/routes";
import type { JobMatchResponse } from "../types";

interface JobMatchCardProps {
  initialJobId?: string;
  onClose?: () => void;
}

export function JobMatchCard({ initialJobId, onClose }: JobMatchCardProps) {
  const toast = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || "");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isChangingJob, setIsChangingJob] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);

  const { data: jobs, isLoading: isLoadingJobs } = useSavedJobs({});
  const { data: resumes, isLoading: isLoadingResumes } = useResumes();
  const matchMutation = useGetJobMatch();

  // Sync initialJobId when provided or fallback to first job
  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
    } else if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, initialJobId, selectedJobId]);

  // Pre-select first available resume
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      toast.error("Please select a target job to evaluate.");
      return;
    }
    if (!selectedResumeId) {
      toast.error("Please select a resume to match against.");
      return;
    }

    try {
      const res = await matchMutation.mutateAsync({
        jobId: selectedJobId,
        resumeId: selectedResumeId,
      });
      setMatchResult(res);
      toast.success("Job Match completed!", "Your contextual evaluation is ready below.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to calculate Job Match.";
      toast.error("Evaluation Error", message);
    }
  };

  const selectedJob = jobs?.find((j) => j.id === selectedJobId);
  const selectedResume = resumes?.find((r) => r.id === selectedResumeId);

  const getScoreDetails = (score: number) => {
    if (score >= 80) {
      return {
        label: "Strong Match",
        badgeTone: "success" as const,
        icon: CheckCircle2,
        colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800",
        description: "Your qualifications closely align with this position's key requirements.",
      };
    }
    if (score >= 60) {
      return {
        label: "Moderate Fit",
        badgeTone: "warning" as const,
        icon: AlertTriangle,
        colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800",
        description: "Good foundation, but several key skill gaps should be addressed.",
      };
    }
    return {
      label: "Significant Gaps",
      badgeTone: "danger" as const,
      icon: XCircle,
      colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800",
      description: "Multiple required skills and domain experience requirements are missing.",
    };
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Job Match Evaluation
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Compare your stored Career Profile and selected resume directly against your target saved job.
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close Job Match Evaluation">
            Close
          </Button>
        )}
      </div>

      {/* Target Job Context Header / Selector */}
      <div className="space-y-4">
        {selectedJob && !isChangingJob ? (
          <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge tone="info" className="uppercase tracking-wider text-[10px]">Target Job</Badge>
                {selectedJob.company && (
                  <span className="text-xs text-secondary font-medium">• {selectedJob.company}</span>
                )}
              </div>
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {selectedJob.title}
              </h4>
              <div className="flex flex-wrap gap-3 text-xs text-secondary">
                {selectedJob.location && <span>📍 {selectedJob.location}</span>}
                {selectedJob.salaryRange && <span>💰 {selectedJob.salaryRange}</span>}
              </div>
            </div>

            {jobs && jobs.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1 self-start sm:self-auto"
                onClick={() => setIsChangingJob(true)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Switch Target Job
              </Button>
            )}
          </div>
        ) : (
          <FormField label="Target Saved Job" htmlFor="select-job" required>
            <div className="flex gap-2">
              <select
                id="select-job"
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setIsChangingJob(false);
                }}
                disabled={isLoadingJobs || matchMutation.isPending}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Saved Job --</option>
                {jobs?.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} at {j.company}
                  </option>
                ))}
              </select>
              {selectedJob && isChangingJob && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChangingJob(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </FormField>
        )}

        {/* Selection Form */}
        <form onSubmit={handleMatch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
          <div className="md:col-span-3">
            <FormField label="Selected Resume to Evaluate" htmlFor="select-resume" required>
              <select
                id="select-resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                disabled={isLoadingResumes || matchMutation.isPending}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Resume --</option>
                {resumes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.target_role || "General"})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="md:col-span-1">
            <Button
              type="submit"
              disabled={matchMutation.isPending || !selectedJobId || !selectedResumeId}
              className="w-full flex items-center justify-center gap-2"
              aria-label="Analyze Job Match"
              aria-busy={matchMutation.isPending}
            >
              <Sparkles className="w-4 h-4" />
              {matchMutation.isPending ? "Analyzing..." : "Analyze Match"}
            </Button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {matchMutation.isPending && (
        <LoadingState
          label="CareerOS is analyzing your background and resume against the target job..."
          icon={<Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse mx-auto" />}
        />
      )}

      {/* Error State */}
      {matchMutation.isError && !matchMutation.isPending && (
        <ErrorState
          title="Evaluation Failed"
          description={
            matchMutation.error instanceof Error
              ? matchMutation.error.message
              : "Could not evaluate job match. Please verify your selected job and resume, then try again."
          }
          onRetry={() => {
            if (selectedJobId && selectedResumeId) {
              void matchMutation.mutateAsync({ jobId: selectedJobId, resumeId: selectedResumeId });
            }
          }}
        />
      )}

      {/* Empty State */}
      {!matchResult && !matchMutation.isPending && !matchMutation.isError && (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-indigo-500/70" />}
          title="Ready for Job Match Evaluation"
          description="Select your target resume and click 'Analyze Match' to compare your skills, experience, and qualifications against this job posting."
        />
      )}

      {/* Analysis Result Display */}
      {matchResult && !matchMutation.isPending && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Score Header Card */}
          {(() => {
            const scoreInfo = getScoreDetails(matchResult.matchScore);
            const ScoreIcon = scoreInfo.icon;
            return (
              <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${scoreInfo.colorClass}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={scoreInfo.badgeTone} className="font-semibold uppercase tracking-wider text-[11px]">
                      {scoreInfo.label}
                    </Badge>
                    <span className="text-xs text-secondary font-medium">
                      Analyzed on {new Date(matchResult.analyzedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-2xl font-extrabold tracking-tight">
                    {matchResult.matchScore}% Match
                  </h4>
                  <p className="text-xs text-secondary max-w-xl">
                    {scoreInfo.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreIcon className="w-10 h-10 shrink-0" />
                </div>
              </div>
            );
          })()}

          {/* Categorized Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Strengths */}
            <Card className="p-5 space-y-3 bg-surface border-emerald-200/50 dark:border-emerald-900/40">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Matching Strengths
                </h5>
                <Badge tone="success">
                  {Array.isArray(matchResult.strengths) ? matchResult.strengths.length : 0}
                </Badge>
              </div>
              {Array.isArray(matchResult.strengths) && matchResult.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {matchResult.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-primary bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200/40 dark:border-emerald-900/30 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-secondary italic">No specific matching strengths identified.</p>
              )}
            </Card>

            {/* Missing Skills */}
            <Card className="p-5 space-y-3 bg-surface border-amber-200/50 dark:border-amber-900/40">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Missing Skills & Requirements
                </h5>
                <Badge tone="warning">
                  {Array.isArray(matchResult.missingSkills) ? matchResult.missingSkills.length : 0}
                </Badge>
              </div>
              {Array.isArray(matchResult.missingSkills) && matchResult.missingSkills.length > 0 ? (
                <ul className="space-y-2">
                  {matchResult.missingSkills.map((skill, i) => (
                    <li key={i} className="text-xs text-primary bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/40 dark:border-amber-900/30 flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-secondary italic">No critical skill gaps identified for this role.</p>
              )}
            </Card>

            {/* Experience Gaps */}
            <Card className="p-5 space-y-3 bg-surface border-rose-200/50 dark:border-rose-900/40">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Experience & Domain Gaps
                </h5>
                <Badge tone="danger">
                  {Array.isArray(matchResult.gaps) ? matchResult.gaps.length : 0}
                </Badge>
              </div>
              {Array.isArray(matchResult.gaps) && matchResult.gaps.length > 0 ? (
                <ul className="space-y-2">
                  {matchResult.gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-secondary bg-hover/60 p-2.5 rounded-lg border border-border/60 flex items-start gap-2">
                      <span className="text-rose-500 font-bold shrink-0">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-secondary italic">No domain experience gaps detected.</p>
              )}
            </Card>

            {/* Actionable Recommendations */}
            <Card className="p-5 space-y-3 bg-surface border-indigo-200/50 dark:border-indigo-900/40">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Actionable Recommendations
                </h5>
                <Badge tone="info">
                  {Array.isArray(matchResult.recommendations) ? matchResult.recommendations.length : 0}
                </Badge>
              </div>
              {Array.isArray(matchResult.recommendations) && matchResult.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {matchResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-primary bg-indigo-50/40 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-200/40 dark:border-indigo-900/30 flex items-start gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-secondary italic">No additional recommendations generated.</p>
              )}
            </Card>
          </div>

          {/* Next-Action Links */}
          <div className="p-4 bg-hover/30 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-primary">Next Actions:</span>
            <div className="flex flex-wrap items-center gap-3">
              {selectedResume && (
                <Link
                  to={APP_ROUTES.resumeLibrary}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <FileText className="w-3.5 h-3.5" /> View Resumes
                </Link>
              )}
              <Link
                to={APP_ROUTES.jobsSaved}
                className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <Briefcase className="w-3.5 h-3.5" /> Saved Jobs
              </Link>
              <Link
                to={APP_ROUTES.careerProfileSkills}
                className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" /> Update Profile Skills <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
