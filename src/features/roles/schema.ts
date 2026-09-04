import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  // Validated against ALL_PERMISSIONS server-side (see actions.ts) rather
  // than encoded in the schema itself — keeps this file free of a runtime
  // dependency on the permission list.
  permissions: z.array(z.string()).default([]),
});

export type RoleInput = z.infer<typeof roleSchema>;
