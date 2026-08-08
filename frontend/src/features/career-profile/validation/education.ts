import { z } from "zod";

export const educationFormSchema = z
  .object({
    institution: z.string().trim().min(1, "Institution is required.").max(255, "Keep this under 255 characters."),
    degree: z.string().trim().min(1, "Degree is required.").max(255, "Keep this under 255 characters."),
    fieldOfStudy: z
      .string()
      .trim()
      .min(1, "Field of study is required.")
      .max(255, "Keep this under 255 characters."),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    grade: z.string().trim().min(1, "Grade is required.").max(255, "Keep this under 255 characters."),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "End date must be the same as or after the start date.",
    path: ["endDate"],
  });

export type EducationFormValues = z.infer<typeof educationFormSchema>;
