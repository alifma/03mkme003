"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { isUniqueViolation } from "@/db/errors";
import { permissions, rolePermissions, roles } from "@/db/schema";
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  type Permission,
} from "@/features/rbac/permissions";
import { requirePermission } from "@/features/rbac/guard";
import { roleSchema, type RoleInput } from "./schema";

export interface RoleActionState {
  error?: string;
}

function sanitizePermissionKeys(keys: string[]): Permission[] {
  const valid = new Set<string>(ALL_PERMISSIONS);
  return keys.filter((key): key is Permission => valid.has(key));
}

async function setRolePermissions(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  roleId: string,
  permissionKeys: Permission[],
) {
  await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (permissionKeys.length === 0) return;

  const rows = await tx
    .select()
    .from(permissions)
    .where(inArray(permissions.key, permissionKeys));
  if (rows.length === 0) return;

  await tx
    .insert(rolePermissions)
    .values(rows.map((row) => ({ roleId, permissionId: row.id })));
}

export async function createRoleAction(
  input: RoleInput,
): Promise<RoleActionState | void> {
  await requirePermission(PERMISSIONS.ROLES_CREATE);

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid role data" };

  const permissionKeys = sanitizePermissionKeys(parsed.data.permissions);

  try {
    await db.transaction(async (tx) => {
      const [role] = await tx
        .insert(roles)
        .values({
          name: parsed.data.name,
          description: parsed.data.description || null,
        })
        .returning();
      await setRolePermissions(tx, role.id, permissionKeys);
    });
  } catch (error) {
    if (isUniqueViolation(error))
      return { error: "A role with this name already exists" };
    throw error;
  }

  revalidatePath("/dashboard/roles");
}

export async function updateRoleAction(
  id: string,
  input: RoleInput,
): Promise<RoleActionState | void> {
  await requirePermission(PERMISSIONS.ROLES_UPDATE);

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid role data" };

  const permissionKeys = sanitizePermissionKeys(parsed.data.permissions);

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(roles)
        .set({
          name: parsed.data.name,
          description: parsed.data.description || null,
        })
        .where(eq(roles.id, id));
      await setRolePermissions(tx, id, permissionKeys);
    });
  } catch (error) {
    if (isUniqueViolation(error))
      return { error: "A role with this name already exists" };
    throw error;
  }

  revalidatePath("/dashboard/roles");
}

export async function deleteRoleAction(
  id: string,
): Promise<RoleActionState | void> {
  await requirePermission(PERMISSIONS.ROLES_DELETE);

  const assigned = await db.query.userRoles.findFirst({
    where: (row, { eq: eqOp }) => eqOp(row.roleId, id),
  });
  if (assigned) {
    return {
      error: "Cannot delete a role that's still assigned to one or more users.",
    };
  }

  await db.delete(roles).where(eq(roles.id, id));
  revalidatePath("/dashboard/roles");
}
