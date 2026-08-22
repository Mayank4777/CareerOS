import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { languagesSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function LanguagesPage() {
  return <SectionResourcePage config={languagesSectionConfig} />;
}
