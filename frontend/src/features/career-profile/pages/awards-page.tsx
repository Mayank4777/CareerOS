import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { awardsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function AwardsPage() {
  return <SectionResourcePage config={awardsSectionConfig} />;
}
