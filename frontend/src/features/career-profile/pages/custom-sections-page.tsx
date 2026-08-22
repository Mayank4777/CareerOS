import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { customSectionsConfig } from "@/features/career-profile/types/career-profile-sections";

export function CustomSectionsPage() {
  return <SectionResourcePage config={customSectionsConfig} />;
}
