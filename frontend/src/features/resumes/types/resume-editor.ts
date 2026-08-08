export type ResumeEditorSectionType =
  | "personal_information"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "achievements"
  | "awards"
  | "volunteer"
  | "publications"
  | "interests"
  | "references"
  | "custom_sections";

export interface ResumeEditorSection {
  id: string;
  section_type: ResumeEditorSectionType;
  title: string;
  display_order: number;
  is_visible: boolean;
}

export interface ResumeEditorSectionItem {
  id: string;
  source_object_id: string;
  display_order: number;
}

export interface ResumeEditorSourceRecord {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  meta?: string[];
  searchText: string;
}

export interface ResumeEditorSectionDefinition {
  type: ResumeEditorSectionType;
  label: string;
  description: string;
}

export interface ResumeEditorSectionFormValues {
  title: string;
  isVisible: boolean;
}

export interface ResumeEditorSectionItemFormValues {
  sourceObjectId: string;
  displayOrder: number;
}

