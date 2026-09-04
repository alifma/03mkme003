import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().max(200).optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Enter your current password to set a new one",
    path: ["currentPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
