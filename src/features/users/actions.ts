"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { isUniqueViolation } from "@/db/errors";
import { userRoles, users } from "@/db/schema";
import { hashPassword } from "@/features/auth/password";
import { requirePermission } from "@/features/rbac/guard";
import { PERMISSIONS } from "@/features/rbac/permissions";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "./schema";

export interface UserActionState {
  error?: string;
}

async function setUserRoles(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  roleIds: string[],
) {
  await tx.delete(userRoles).where(eq(userRoles.userId, userId));
  if (roleIds.length === 0) return;
  await tx
    .insert(userRoles)
    .values(roleIds.map((roleId) => ({ userId, roleId })));
}

export async function createUserAction(
  input: CreateUserInput,
): Promise<UserActionState | void> {
  await requirePermission(PERMISSIONS.USERS_CREATE);

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid user data" };

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: parsed.data.name || null,
          username: parsed.data.username,
          email: parsed.data.email,
          passwordHash,
        })
        .returning();
      await setUserRoles(tx, user.id, parsed.data.roleIds);
    });
  } catch (error) {
    if (isUniqueViolation(error))
      return { error: "A user with this username or email already exists" };
    throw error;
  }

  revalidatePath("/dashboard/users");
}

export async function updateUserAction(
  id: string,
  input: UpdateUserInput,
): Promise<UserActionState | void> {
  await requirePermission(PERMISSIONS.USERS_UPDATE);

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid user data" };

  try {
    await db.transaction(async (tx) => {
      const passwordHash = parsed.data.password
        ? await hashPassword(parsed.data.password)
        : undefined;

      await tx
        .update(users)
        .set({
          name: parsed.data.name || null,
          username: parsed.data.username,
          email: parsed.data.email,
          ...(passwordHash ? { passwordHash } : {}),
        })
        .where(eq(users.id, id));

      await setUserRoles(tx, id, parsed.data.roleIds);
    });
  } catch (error) {
    if (isUniqueViolation(error))
      return { error: "A user with this username or email already exists" };
    throw error;
  }

  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(
  id: string,
): Promise<UserActionState | void> {
  const session = await requirePermission(PERMISSIONS.USERS_DELETE);

  if (session.user.id === id) {
    return { error: "You can't delete your own account." };
  }

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/dashboard/users");
}
