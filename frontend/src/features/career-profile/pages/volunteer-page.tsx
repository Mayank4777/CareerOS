import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { volunteerSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function VolunteerPage() {
  return <SectionResourcePage config={volunteerSectionConfig} />;
}
