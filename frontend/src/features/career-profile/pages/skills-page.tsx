import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { skillsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function SkillsPage() {
  return <SectionResourcePage config={skillsSectionConfig} />;
}
