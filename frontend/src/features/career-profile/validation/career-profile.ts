import { z } from "zod";

const optionalUrlMessage = "Enter a valid URL, such as https://example.com.";
const optionalPhoneMessage = "Enter a valid phone number using digits, spaces, and +, (), -, or .";

function optionalTrimmedString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Keep this under ${maxLength} characters.`)
    .optional()
    .transform((value) => value ?? "");
}

function optionalUrlField(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Keep this under ${maxLength} characters.`)
    .refine((value) => value.length === 0 || isValidUrl(value), { message: optionalUrlMessage })
    .optional()
    .transform((value) => value ?? "");
}

function optionalPhoneField(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Keep this under ${maxLength} characters.`)
    .refine((value) => value.length === 0 || /^[+()\d\s.-]{7,32}$/.test(value), {
      message: optionalPhoneMessage,
    })
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

export const careerProfileFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80, "Keep this under 80 characters."),
  lastName: z.string().trim().min(1, "Last name is required.").max(80, "Keep this under 80 characters."),
  headline: z.string().trim().min(1, "Headline is required.").max(140, "Keep this under 140 characters."),
  phone: optionalPhoneField(32),
  location: optionalTrimmedString(120),
  website: optionalUrlField(200),
  linkedin: optionalUrlField(200),
  github: optionalUrlField(200),
  summary: z
    .string()
    .trim()
    .min(20, "Write a short summary with at least 20 characters.")
    .max(1000, "Keep this under 1000 characters."),
});

export type CareerProfileFormValues = z.infer<typeof careerProfileFormSchema>;
