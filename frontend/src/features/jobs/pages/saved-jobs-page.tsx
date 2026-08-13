import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useSavedJobs, useCreateSavedJob, useUpdateSavedJob, useDeleteSavedJob } from "../hooks/use-jobs";
import { SavedJobCard } from "../components/saved-job-card";
import { SaveJobModal } from "../components/save-job-modal";
import { JobMatchCard } from "@/features/ai-coach/components/job-match-card";
import type { SavedJob, SavedJobFormValues } from "../types";

export function SavedJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedJob | null>(null);
  const [matchJobId, setMatchJobId] = useState<string | null>(null);

  const { data: jobs, isLoading, isError, refetch } = useSavedJobs({ search, status: statusFilter });
  const createMutation = useCreateSavedJob();
  const updateMutation = useUpdateSavedJob();
  const deleteMutation = useDeleteSavedJob();

  const handleSaveJob = async (values: SavedJobFormValues) => {
    if (editingJob) {
      await updateMutation.mutateAsync({ jobId: editingJob.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget || deleteMutation.isPending) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleStatusChange = async (jobId: string, status: SavedJob["status"]) => {
    await updateMutation.mutateAsync({ jobId, payload: { status } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Saved Jobs"
        description="Track and manage target job opportunities you want to apply for."
        actions={
          <Button
            onClick={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Save Job
          </Button>
        }
      />

      {matchJobId && (
        <JobMatchCard
          initialJobId={matchJobId}
          onClose={() => setMatchJobId(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-hover/50 p-4 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-secondary hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading saved jobs..." />
      ) : isError ? (
        <ErrorState title="Failed to load jobs" description="Could not connect to the server." onRetry={refetch} />
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          title="No saved jobs found"
          description={search ? "No jobs match your search filter." : "You haven't saved any job opportunities yet."}
          actionLabel="Save New Job"
          onAction={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <SavedJobCard
              key={job.id}
              job={job}
              onEdit={(j) => {
                setEditingJob(j);
                setIsModalOpen(true);
              }}
              onDelete={(jobId) => {
                const target = jobs.find((item) => item.id === jobId) ?? job;
                setDeleteTarget(target);
              }}
              onStatusChange={handleStatusChange}
              onCheckMatch={(j) => setMatchJobId(j.id)}
            />
          ))}
        </div>
      )}

      <SaveJobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSaveJob}
        initialValues={editingJob}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteJob();
        }}
        title="Remove Saved Job?"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.title} at ${deleteTarget.company}"? This action cannot be undone.`
            : "Remove this job from your saved list?"
        }
        confirmLabel={deleteMutation.isPending ? "Removing..." : "Remove Job"}
      />
    </div>
  );
}
