import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { achievementsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function AchievementsPage() {
  return <SectionResourcePage config={achievementsSectionConfig} />;
}
