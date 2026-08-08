import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { referencesSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function ReferencesPage() {
  return <SectionResourcePage config={referencesSectionConfig} />;
}
