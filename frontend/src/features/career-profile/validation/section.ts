import { z } from "zod";

import type {
  SectionFieldConfig,
  SectionFormValues,
  SectionValidationRule,
} from "@/features/career-profile/types/section";
import { displayChoiceLabel, isValidChoice, normalizeChoiceValue } from "@/features/career-profile/utils/section-choice";

export function buildSectionSchema(fields: SectionFieldConfig[], validationRules?: SectionValidationRule[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    shape[field.name] = buildFieldSchema(field);
  }

  let schema: z.ZodTypeAny = z.object(shape);

  if (validationRules && validationRules.length > 0) {
    schema = schema.superRefine((values, ctx) => {
      for (const rule of validationRules) {
        rule.validate(values as SectionFormValues, ctx);
      }
    });
  }

  return schema;
}

export function buildSectionDefaultValues(fields: SectionFieldConfig[], record?: Record<string, unknown> | null) {
  const values: SectionFormValues = {};

  for (const field of fields) {
    const value = record?.[field.name];

    if (field.kind === "checkbox") {
      values[field.name] = Boolean(value);
      continue;
    }

    if (field.kind === "combobox") {
      values[field.name] = displayChoiceLabel(value, field.options);
      continue;
    }

    if (field.kind === "number") {
      values[field.name] = typeof value === "number" ? value : "";
      continue;
    }

    values[field.name] = typeof value === "string" ? value : "";
  }

  return values;
}

function buildFieldSchema(field: SectionFieldConfig) {
  const maxLength = field.maxLength ?? 255;

  switch (field.kind) {
    case "checkbox":
      return z.boolean().default(false);
    case "number":
      return z.preprocess(
        (value) => {
          if (value === "" || value === null || value === undefined) {
            return undefined;
          }

          const parsed = typeof value === "number" ? value : Number(value);
          return Number.isNaN(parsed) ? undefined : parsed;
        },
        z.number().int("Enter a whole number.").min(0, "Use a positive number.").optional()
      );
    case "date":
      return field.required
        ? z.string().min(1, `${field.label} is required.`)
        : z
            .string()
            .optional()
            .transform((value) => value ?? "");
    case "combobox": {
      const schema = z
        .string()
        .trim()
        .max(maxLength, `Keep this under ${maxLength} characters.`);

      const withRequired = field.required
        ? schema.min(1, `${field.label} is required.`)
        : schema.optional().transform((value) => value ?? "");

      if (!field.options || field.options.length === 0) {
        return withRequired;
      }

      if (field.allowCustom) {
        return withRequired.transform((value) => normalizeChoiceValue(value, field.options, true));
      }

      return withRequired
        .refine((value) => isValidChoice(value, field.options), {
          message: `Choose a valid ${field.label.toLowerCase()}.`,
        })
        .transform((value) => normalizeChoiceValue(value, field.options));
    }
    case "email":
      return buildStringSchema(field, maxLength).refine(
        (value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        { message: "Enter a valid email address." }
      );
    case "url":
      return buildStringSchema(field, maxLength).refine(
        (value) => value.length === 0 || isValidUrl(value),
        { message: "Enter a valid URL, such as https://example.com." }
      );
    case "textarea":
    case "text":
    default:
      return buildStringSchema(field, maxLength);
  }
}

function buildStringSchema(field: SectionFieldConfig, maxLength: number) {
  if (field.required) {
    return z
      .string()
      .trim()
      .min(1, `${field.label} is required.`)
      .max(maxLength, `Keep this under ${maxLength} characters.`);
  }

  return z
    .string()
    .trim()
    .max(maxLength, `Keep this under ${maxLength} characters.`)
    .optional()
    .transform((value) => value ?? "");
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
