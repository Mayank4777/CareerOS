import type { ReactNode } from "react";
import type { RefinementCtx } from "zod";

export type SectionFieldKind =
  | "text"
  | "textarea"
  | "date"
  | "url"
  | "email"
  | "number"
  | "checkbox"
  | "combobox";

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface SectionFieldConfig {
  name: string;
  label: string;
  kind: SectionFieldKind;
  placeholder?: string;
  description?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  options?: ChoiceOption[];
  allowCustom?: boolean;
}

export interface SectionCardConfig {
  titleField: string;
  subtitleField?: string;
  descriptionField?: string;
  metaFields?: string[];
  statusField?: string;
  statusLabel?: string;
}

export interface SectionValidationRule {
  validate: (values: Record<string, unknown>, ctx: RefinementCtx) => void;
}

export interface SectionModuleConfig {
  key: string;
  route: string;
  apiRoot: string;
  queryKey: readonly [string, string];
  title: string;
  description: string;
  singularLabel: string;
  emptyStateTitle: string;
  emptyStateDescription: {
    withProfile: string;
    withoutProfile: string;
  };
  fields: SectionFieldConfig[];
  card: SectionCardConfig;
  validationRules?: SectionValidationRule[];
  uniqueFields?: string[];
}

export interface SectionRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectionModulePageProps {
  config: SectionModuleConfig;
}

export interface SectionResourceDialogProps<TRecord extends SectionRecord> {
  open: boolean;
  record: TRecord | null;
  config: SectionModuleConfig;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

export interface SectionRecordCardProps<TRecord extends SectionRecord> {
  record: TRecord;
  config: SectionModuleConfig;
  onEdit: (record: TRecord) => void;
  onDelete: (record: TRecord) => void;
}

export interface SectionResourcePageProps {
  config: SectionModuleConfig;
}

export type SectionFormValues = Record<string, unknown>;
