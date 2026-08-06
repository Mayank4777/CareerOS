import { z } from "zod";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long.");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, "First name is required."),
    last_name: z.string().trim().min(1, "Last name is required."),
    email: z.string().email("Enter a valid email address."),
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
