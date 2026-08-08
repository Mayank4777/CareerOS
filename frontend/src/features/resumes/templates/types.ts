import type { Resume } from "@/features/resumes/types/resume";
import type {
  ResumeEditorSection,
  ResumeEditorSectionItem,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";

export interface ResumeTemplateProps {
  resume: Resume;
  sections: ResumeEditorSection[];
  allSectionItems: Record<string, ResumeEditorSectionItem[]>;
  allSourceRecords: Record<ResumeEditorSectionType, ResumeEditorSourceRecord[]>;
}

export function getSectionRecords(
  section: ResumeEditorSection,
  allSectionItems: Record<string, ResumeEditorSectionItem[]>,
  allSourceRecords: Record<ResumeEditorSectionType, ResumeEditorSourceRecord[]>
): ResumeEditorSourceRecord[] {
  const items = allSectionItems[section.id] ?? [];
  const records = allSourceRecords[section.section_type] ?? [];
  const itemMap = new Map(items.map((item) => [item.source_object_id, item]));
  return records
    .filter((record) => itemMap.has(record.id))
    .slice()
    .sort((left, right) => (itemMap.get(left.id)?.display_order ?? 0) - (itemMap.get(right.id)?.display_order ?? 0));
}
