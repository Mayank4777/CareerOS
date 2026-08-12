import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/cards/section-card";
import { SectionResourcePage } from "@/features/career-profile/components/section-resource-page";
import { SkillsAutocompleteInput } from "@/features/career-profile/components/skills-autocomplete-input";
import { useSectionResource } from "@/features/career-profile/hooks/use-section-resource";
import { skillsSectionConfig } from "@/features/career-profile/types/career-profile-sections";
import type { SectionRecord } from "@/features/career-profile/types/section";

export function SkillsPage() {
  const { recordQuery, createRecord, deleteRecord, isCreatingRecord } =
    useSectionResource<SectionRecord>(skillsSectionConfig);

  const rawRecords = (recordQuery.data ?? []) as SectionRecord[];
  const existingSkills = rawRecords.map((r) => ({
    id: r.id,
    name: String(r.name || ""),
    category: r.category ? String(r.category) : undefined,
    proficiency_level: r.proficiency_level ? String(r.proficiency_level) : undefined,
  }));

  const handleAddSkill = async (skillName: string) => {
    await createRecord({
      name: skillName,
      proficiency_level: "intermediate",
    });
  };

  const handleRemoveSkill = async (skillId: string) => {
    await deleteRecord(skillId);
  };

  const topContent = (
    <SectionCard
      title="Fast Skills Autocomplete Input"
      description="Type a skill prefix to get instant real-time suggestions. Press Enter to add immediately and keep typing."
      className="overflow-visible"
    >
      <Card className="border-brand-500/20 bg-surface shadow-md overflow-visible">
        <CardContent className="p-5 overflow-visible">
          <SkillsAutocompleteInput
            existingSkills={existingSkills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            isAdding={isCreatingRecord}
          />
        </CardContent>
      </Card>
    </SectionCard>
  );

  return <SectionResourcePage config={skillsSectionConfig} topContent={topContent} />;
}
