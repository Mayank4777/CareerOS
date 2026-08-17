import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Briefcase, Plus, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui/empty-state";
import { useSavedJobs } from "@/features/jobs/hooks/use-jobs";
import { useToast } from "@/components/ui/toast";
import { APP_ROUTES } from "@/constants/routes";
import { useGenerateRoadmap } from "../hooks/use-ai-coach";
import type { CareerRoadmap } from "../types";

interface GenerateRoadmapCardProps {
  onSuccess?: (roadmap: CareerRoadmap) => void;
  onCancel?: () => void;
  isStandalone?: boolean;
}

export function GenerateRoadmapCard({
  onSuccess,
  onCancel,
  isStandalone = false,
}: GenerateRoadmapCardProps) {
  const toast = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const { data: jobs, isLoading: isLoadingJobs } = useSavedJobs({});
  const generateMutation = useGenerateRoadmap();

  // Auto-select first job if available
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      toast.error("Saved Job Required", "Please select a target job to generate a career roadmap.");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({ job_id: selectedJobId });
      toast.success(
        "Roadmap Ready!",
        `Career roadmap loaded for ${result.target_role || result.title}.`
      );
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to generate career roadmap. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { status?: number; data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        } else if (response?.status === 404) {
          errorMessage = "Target saved job was not found.";
        } else if (response?.status === 400) {
          errorMessage = "Invalid job selection. Please select a valid saved job.";
        } else if (response?.status === 500) {
          errorMessage = "Server error while constructing roadmap. Please try again shortly.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error("Generation Error", errorMessage);
    }
  };

  if (!isLoadingJobs && (!jobs || jobs.length === 0)) {
    return (
      <EmptyState
        icon={<Briefcase className="w-10 h-10 text-indigo-500/70" />}
        title="No Saved Jobs Found"
        description="To generate a tailored Career Roadmap, save at least one target job posting in your Saved Jobs list first."
        actionLabel="Go to Saved Jobs"
        onAction={() => {
          window.location.href = APP_ROUTES.jobsSaved;
        }}
      />
    );
  }

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-surface via-surface to-indigo-50/20 dark:to-indigo-950/10 border-indigo-200/50 dark:border-indigo-900/40">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Create Target Career Roadmap
          </h3>
          <p className="text-xs text-secondary max-w-2xl leading-relaxed">
            CareerOS deterministically maps your current profile capabilities against your target job&apos;s requirements to build a ordered multi-phase execution timeline.
          </p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        <FormField label="Target Saved Job" htmlFor="roadmap-select-job" required>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              id="roadmap-select-job"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={isLoadingJobs || generateMutation.isPending}
              className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">-- Select Target Saved Job --</option>
              {jobs?.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} at {job.company} {job.location ? `(${job.location})` : ""}
                </option>
              ))}
            </select>

            <Button
              type="submit"
              disabled={generateMutation.isPending || !selectedJobId || isLoadingJobs}
              className="shrink-0 flex items-center justify-center gap-2"
              aria-label="Generate Career Roadmap"
              aria-busy={generateMutation.isPending}
            >
              <Sparkles className="w-4 h-4" />
              {generateMutation.isPending ? "Generating..." : "Generate Roadmap"}
            </Button>
          </div>
        </FormField>

        <div className="p-3.5 bg-hover/50 rounded-xl border border-border/70 text-xs text-secondary space-y-1">
          <div className="font-semibold text-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-500" />
            Deterministic Alignment & Duplicate Prevention
          </div>
          <p>
            If a roadmap already exists for the selected target job, CareerOS will open that existing roadmap directly so you don&apos;t lose your phase progression progress.
          </p>
        </div>
      </form>

      {!isStandalone && (
        <div className="pt-2 border-t border-border flex justify-end">
          <Link
            to={APP_ROUTES.jobsSaved}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
          >
            <Briefcase className="w-3.5 h-3.5" /> View all saved jobs
          </Link>
        </div>
      )}
    </Card>
  );
}
