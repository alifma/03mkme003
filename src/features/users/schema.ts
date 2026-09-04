import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50)
  .regex(/^[a-z0-9_.-]+$/i, "Only letters, numbers, and _ . - are allowed");

export const createUserSchema = z.object({
  name: z.string().max(200).optional(),
  username: usernameSchema,
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleIds: z.array(z.string()).default([]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().max(200).optional(),
  username: usernameSchema,
  email: z.email(),
  // Leave blank to keep the current password.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  roleIds: z.array(z.string()).default([]),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
