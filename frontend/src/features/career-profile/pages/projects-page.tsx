import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { projectsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function ProjectsPage() {
  return <SectionResourcePage config={projectsSectionConfig} />;
}
