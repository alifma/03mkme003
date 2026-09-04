import { z } from "zod";

export const credentialsSchema = z.object({
  // Accepts either username or email — resolved against both columns in
  // features/auth/config.ts's authorize(). Kept as a plain non-empty string
  // rather than z.email() since a username isn't an email address.
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const loginSchema = credentialsSchema.extend({
  callbackUrl: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
