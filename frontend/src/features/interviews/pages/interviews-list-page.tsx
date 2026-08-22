import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview } from "../hooks/use-interviews";
import { InterviewCard } from "../components/interview-card";
import { ScheduleInterviewModal } from "../components/schedule-interview-modal";
import type { Interview, InterviewFormValues } from "../types";

export function InterviewsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Interview | null>(null);

  const { data: interviews, isLoading, isError, refetch } = useInterviews({ search, status: statusFilter });
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();
  const deleteMutation = useDeleteInterview();

  const handleSaveInterview = async (values: InterviewFormValues) => {
    if (editingInterview) {
      await updateMutation.mutateAsync({ interviewId: editingInterview.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDeleteInterview = async () => {
    if (!deleteTarget || deleteMutation.isPending) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleStatusChange = async (id: string, status: Interview["status"]) => {
    await updateMutation.mutateAsync({ interviewId: id, payload: { status } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Interviews & Preparation"
        description="Schedule, prepare for, and keep track of all upcoming interview rounds."
        actions={
          <Button
            onClick={() => {
              setEditingInterview(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Schedule Interview
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-hover/50 p-4 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search by company, position, or round..."
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading scheduled interviews..." />
      ) : isError ? (
        <ErrorState title="Failed to load interviews" description="Could not fetch interview schedule." onRetry={refetch} />
      ) : !interviews || interviews.length === 0 ? (
        <EmptyState
          title="No interviews scheduled"
          description={search ? "No interviews match your filter." : "You haven't scheduled any upcoming interview sessions yet."}
          actionLabel="Schedule First Interview"
          onAction={() => {
            setEditingInterview(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviews.map((item) => (
            <InterviewCard
              key={item.id}
              interview={item}
              onEdit={(i) => {
                setEditingInterview(i);
                setIsModalOpen(true);
              }}
              onDelete={(id) => {
                const target = interviews.find((it) => it.id === id) ?? item;
                setDeleteTarget(target);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={handleSaveInterview}
        initialValues={editingInterview}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteInterview();
        }}
        title="Delete Interview?"
        description={
          deleteTarget
            ? `Are you sure you want to delete the "${deleteTarget.round}" interview? This action cannot be undone.`
            : "Delete this interview entry?"
        }
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete Interview"}
      />
    </div>
  );
}
