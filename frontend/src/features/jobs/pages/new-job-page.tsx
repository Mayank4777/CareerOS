import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { SaveJobModal } from "../components/save-job-modal";
import { useCreateSavedJob } from "../hooks/use-jobs";
import { useToast } from "@/components/ui/toast";
import type { SavedJobFormValues } from "../types";

export function NewJobPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateSavedJob();

  const handleSubmit = async (values: SavedJobFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Job saved successfully!");
      navigate("/jobs/saved");
    } catch {
      toast.error("Failed to save job.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="Add New Job"
        description="Bookmark and save a job opportunity to track your application process."
      />
      <div className="bg-surface border border-border rounded-xl p-6 mt-6">
        <SaveJobModal
          isOpen={true}
          onClose={() => navigate("/jobs/saved")}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
