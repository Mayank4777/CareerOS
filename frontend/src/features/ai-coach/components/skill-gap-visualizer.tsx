import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Zap, Target, Briefcase, AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSavedJobs } from "@/features/jobs/hooks/use-jobs";
import { useAnalyzeJobSkillGap } from "../hooks/use-ai-coach";
import { useToast } from "@/components/ui/toast";
import { Link } from "react-router-dom";
import type { SkillGapJobResult } from "../types";

export function SkillGapVisualizer() {
  const toast = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [analysis, setAnalysis] = useState<SkillGapJobResult | null>(null);

  const { data: savedJobsData, isLoading: isLoadingJobs } = useSavedJobs();
  const savedJobs = savedJobsData ?? [];

  const analyzeMutation = useAnalyzeJobSkillGap();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      toast.error("Please select a target saved job.");
      return;
    }

    try {
      const res = await analyzeMutation.mutateAsync({ jobId: selectedJobId });
      setAnalysis(res);
      toast.success("Skill gap analysis completed.");
    } catch {
      toast.error("Failed to analyze skill gaps.");
    }
  };

  const selectedJob = savedJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-purple-500/20 bg-card/90">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Target className="w-5 h-5" />
              </span>
              Contextual Skill Gap Analysis
            </h3>
            <p className="text-xs text-secondary mt-1">
              Select one of your Saved Jobs to analyze your profile skills, missing requirements, and actionable recommendations.
            </p>
          </div>
        </div>

        {isLoadingJobs ? (
          <div className="py-4 text-center text-xs text-secondary animate-pulse" aria-busy="true">
            Loading saved jobs...
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface/50 border border-border text-center space-y-3">
            <Briefcase className="w-8 h-8 text-secondary mx-auto" />
            <p className="text-sm font-medium text-primary">No Saved Jobs Available</p>
            <p className="text-xs text-secondary">
              You need at least one Saved Job to perform contextual skill gap analysis.
            </p>
            <Link to="/jobs/saved">
              <Button variant="outline" size="sm" className="mt-2">
                Manage Saved Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleAnalyze} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Target Saved Job" htmlFor="sg-job-select" className="sm:col-span-2" required>
              <select
                id="sg-job-select"
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-sm text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setAnalysis(null);
                }}
              >
                <option value="">-- Select a Saved Job --</option>
                {savedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="flex items-end sm:col-span-1">
              <Button
                type="submit"
                variant="gradient"
                disabled={!selectedJobId || analyzeMutation.isPending}
                aria-busy={analyzeMutation.isPending}
                className="w-full flex items-center justify-center gap-2 h-10"
              >
                <Zap className="w-4 h-4" />
                {analyzeMutation.isPending ? "Analyzing Gaps..." : "Analyze Skill Gap"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {analyzeMutation.isPending && (
        <Card className="p-8 text-center space-y-3 border-purple-500/30 bg-purple-500/5 animate-pulse" aria-busy="true">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
          <h4 className="text-sm font-semibold text-primary">Evaluating Skill Gap...</h4>
          <p className="text-xs text-secondary max-w-md mx-auto">
            Comparing profile capabilities against {selectedJob ? selectedJob.title : "selected job"} requirements and generating recommendations.
          </p>
        </Card>
      )}

      {analyzeMutation.isError && (
        <Card className="p-6 border-red-500/30 bg-red-500/5 space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="text-sm font-bold">Analysis Failed</h4>
          </div>
          <p className="text-xs text-secondary">
            Unable to analyze skill gaps for this job right now. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={handleAnalyze}>
            Retry Analysis
          </Button>
        </Card>
      )}

      {analysis && !analyzeMutation.isPending && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <Card className="p-6 space-y-4 border-emerald-500/20 bg-card/90">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Matched Skills ({analysis.matched_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.matched_skills.length > 0 ? (
                  analysis.matched_skills.map((sk) => (
                    <Badge key={sk} tone="success" className="px-2.5 py-1 text-xs">
                      {sk}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-secondary">No exact skill matches recorded yet.</span>
                )}
              </div>
            </Card>

            {/* Missing Skills */}
            <Card className="p-6 space-y-4 md:col-span-2 border-amber-500/20 bg-card/90">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Missing Skills ({analysis.missing_skills.length})
              </h4>
              {analysis.missing_skills.length > 0 ? (
                <div className="space-y-3">
                  {analysis.missing_skills.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-surface/50 border border-border/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{item.skill}</span>
                        <Badge
                          tone={
                            item.importance === "high"
                              ? "danger"
                              : item.importance === "medium"
                              ? "warning"
                              : "neutral"
                          }
                          className="uppercase text-[10px] tracking-wider px-2 py-0.5"
                        >
                          {item.importance} Importance
                        </Badge>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">{item.reason}</p>
                      <div className="text-xs text-cyan-400 flex items-start gap-1.5 pt-1">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{item.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold">No critical skill gaps identified!</span>
              )}
            </Card>
          </div>

          {/* Partial Skills & Learning Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partial Skills */}
            <Card className="p-6 space-y-4 border-indigo-500/20 bg-card/90">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Partially Matched Skills ({analysis.partial_skills.length})
              </h4>
              {analysis.partial_skills.length > 0 ? (
                <div className="space-y-3">
                  {analysis.partial_skills.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-surface/50 border border-border/70 space-y-2">
                      <span className="text-sm font-bold text-primary">{item.skill}</span>
                      <p className="text-xs text-secondary leading-relaxed">{item.reason}</p>
                      <div className="text-xs text-cyan-400 flex items-start gap-1.5 pt-1">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{item.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-secondary">No partial skill gaps identified.</span>
              )}
            </Card>

            {/* Actionable Recommendations */}
            <Card className="p-6 space-y-4 border-purple-500/20 bg-card/90">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Actionable Learning Roadmap
              </h4>
              {analysis.recommendations.length > 0 ? (
                <div className="space-y-2.5">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="text-xs text-secondary flex items-start gap-2.5 bg-surface/50 p-3 rounded-xl border border-border/60">
                      <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-secondary">No recommendations generated.</span>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
