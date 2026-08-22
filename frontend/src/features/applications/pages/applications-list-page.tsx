import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from "../hooks/use-applications";
import { ApplicationCard } from "../components/application-card";
import { ApplicationModal } from "../components/application-modal";
import type { Application, ApplicationFormValues } from "../types";

export function ApplicationsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const { data: applications, isLoading, isError, refetch } = useApplications({ search, status: statusFilter });
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const handleSaveApp = async (values: ApplicationFormValues) => {
    if (editingApp) {
      await updateMutation.mutateAsync({ applicationId: editingApp.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDeleteApp = async () => {
    if (!deleteTarget || deleteMutation.isPending) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Job Applications"
        description="Track your applications, interview progress, and offers in one place."
        actions={
          <Button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Application
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-hover/50 p-4 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            placeholder="Search by position or company..."
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
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading application history..." />
      ) : isError ? (
        <ErrorState title="Failed to load applications" description="Could not fetch applications list." onRetry={refetch} />
      ) : !applications || applications.length === 0 ? (
        <EmptyState
          title="No applications tracked"
          description={search ? "No applications match your filter." : "Start tracking your active job applications to monitor status and stage."}
          actionLabel="Add First Application"
          onAction={() => {
            setEditingApp(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onEdit={(a) => {
                setEditingApp(a);
                setIsModalOpen(true);
              }}
              onDelete={(id) => {
                const target = applications.find((item) => item.id === id) ?? app;
                setDeleteTarget(target);
              }}
            />
          ))}
        </div>
      )}

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleSaveApp}
        initialValues={editingApp}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteApp();
        }}
        title="Delete Application?"
        description={
          deleteTarget
            ? `Are you sure you want to remove your application for "${deleteTarget.position} at ${deleteTarget.company}"? This action cannot be undone.`
            : "Delete this application entry?"
        }
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete Application"}
      />
    </div>
  );
}
