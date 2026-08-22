import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { certificationsSectionConfig } from "@/features/career-profile/types/career-profile-sections";

export function CertificationsPage() {
  return <SectionResourcePage config={certificationsSectionConfig} />;
}
