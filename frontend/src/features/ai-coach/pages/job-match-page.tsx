import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { JobMatchCard } from "../components/job-match-card";

export function JobMatchPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || undefined;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Job Match Evaluation"
        description="Evaluate target job postings against your stored career profile and resumes."
      />
      <JobMatchCard initialJobId={jobId} />
    </div>
  );
}
