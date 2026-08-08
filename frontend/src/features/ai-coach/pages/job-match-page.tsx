import { PageHeader } from "@/components/ui/page-header";
import { JobMatchCard } from "../components/job-match-card";

export function JobMatchPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Job Match Evaluation"
        description="Evaluate target job postings against your profile to maximize interview call odds."
      />
      <JobMatchCard />
    </div>
  );
}
