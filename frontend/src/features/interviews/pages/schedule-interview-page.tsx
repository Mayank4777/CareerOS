import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { ScheduleInterviewModal } from "../components/schedule-interview-modal";
import { useCreateInterview } from "../hooks/use-interviews";
import { useToast } from "@/components/ui/toast";
import type { InterviewFormValues } from "../types";

export function ScheduleInterviewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateInterview();

  const handleSubmit = async (values: InterviewFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Interview scheduled successfully!");
      navigate("/interviews/list");
    } catch {
      toast.error("Failed to schedule interview.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        title="Schedule Interview"
        description="Book a new interview session and add it to your preparation calendar."
      />
      <div className="bg-surface border border-border rounded-xl p-6 mt-6">
        <ScheduleInterviewModal
          isOpen={true}
          onClose={() => navigate("/interviews/list")}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
