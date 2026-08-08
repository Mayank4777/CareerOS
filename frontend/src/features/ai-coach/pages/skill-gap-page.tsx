import { PageHeader } from "@/components/ui/page-header";
import { SkillGapVisualizer } from "../components/skill-gap-visualizer";

export function SkillGapPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Skill Gap Analysis"
        description="Identify skill missing for target career roles and receive personalized learning recommendations."
      />
      <SkillGapVisualizer />
    </div>
  );
}
