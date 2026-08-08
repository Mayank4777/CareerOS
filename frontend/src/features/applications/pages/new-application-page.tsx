import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { ApplicationModal } from "../components/application-modal";
import { useCreateApplication } from "../hooks/use-applications";
import { useToast } from "@/components/ui/toast";
import type { ApplicationFormValues } from "../types";

export function NewApplicationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateApplication();

  const handleSubmit = async (values: ApplicationFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Application created successfully!");
      navigate("/applications/list");
    } catch {
      toast.error("Failed to save application.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="New Application"
        description="Add a new job application to your tracking board."
      />
      <div className="bg-surface border border-border rounded-xl p-6 mt-6">
        <ApplicationModal
          isOpen={true}
          onClose={() => navigate("/applications/list")}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
