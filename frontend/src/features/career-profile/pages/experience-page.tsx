import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { experienceSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function ExperiencePage() {
  return <SectionResourcePage config={experienceSectionConfig} />;
}
