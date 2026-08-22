import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { interestsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function InterestsPage() {
  return <SectionResourcePage config={interestsSectionConfig} />;
}
