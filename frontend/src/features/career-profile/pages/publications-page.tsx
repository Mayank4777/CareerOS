import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { publicationsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function PublicationsPage() {
  return <SectionResourcePage config={publicationsSectionConfig} />;
}
