import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { APP_ROUTES } from "@/constants/routes";
import { EducationSection } from "@/features/career-profile/components/education-section";
import { fetchCareerProfile } from "@/features/career-profile/services/career-profile";

export function EducationPage() {
  const profileQuery = useQuery({
    queryKey: ["career-profile"],
    queryFn: fetchCareerProfile,
  });

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading education..." />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        description="We could not load your education records right now. Please try again in a moment."
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Career Profile", href: APP_ROUTES.careerProfile },
          { label: "Education" },
        ]}
        title="Education"
        description="List, create, edit, and delete education records inside the existing Career Profile workspace."
      />

      <EducationSection canManageEducation={Boolean(profileQuery.data)} />
    </div>
  );
}
