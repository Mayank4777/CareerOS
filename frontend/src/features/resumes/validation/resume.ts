import { z } from "zod";

export const resumeStatusSchema = z.enum(["draft", "in_review", "approved", "applied", "archived"]);

export const createResumeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  template: z.string().trim().optional().default("modern"),
  status: resumeStatusSchema,
});

export const renameResumeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
});

