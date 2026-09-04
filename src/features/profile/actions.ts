"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/features/auth/config";
import { hashPassword, verifyPassword } from "@/features/auth/password";
import { updateProfileSchema, type UpdateProfileInput } from "./schema";

export interface ProfileActionState {
  error?: string;
}

// Not requirePermission() — editing your OWN profile isn't gated by an ACL
// permission, just by being signed in. Changing your name is unguarded;
// changing your password requires re-entering the current one (defense
// against a left-open session, not against a compromised account outright).
export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<ProfileActionState | void> {
  const session = await auth();
  if (!session) return { error: "Not signed in" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const updates: { name?: string | null; passwordHash?: string } = {
    name: parsed.data.name || null,
  };

  if (parsed.data.newPassword) {
    const user = await db.query.users.findFirst({
      where: (u, { eq: eqOp }) => eqOp(u.id, session.user.id),
    });
    if (!user?.passwordHash) {
      return { error: "This account has no password set — contact an admin." };
    }

    const valid = await verifyPassword(
      parsed.data.currentPassword ?? "",
      user.passwordHash,
    );
    if (!valid) return { error: "Current password is incorrect" };

    updates.passwordHash = await hashPassword(parsed.data.newPassword);
  }

  await db.update(users).set(updates).where(eq(users.id, session.user.id));

  revalidatePath("/dashboard/profile");
}
