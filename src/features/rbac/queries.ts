import { db } from "@/db";
import type { Permission } from "./permissions";

export interface UserRolesAndPermissions {
  roles: string[];
  permissions: Permission[];
}

/**
 * Resolves a user's roles and the flattened, deduplicated set of permissions
 * granted by those roles. Called once at sign-in (see jwt callback in
 * features/auth/config.ts) — the result is cached in the session token, not
 * re-queried on every request.
 */
export async function getUserRolesAndPermissions(
  userId: string,
): Promise<UserRolesAndPermissions> {
  const rows = await db.query.userRoles.findMany({
    where: (userRole, { eq }) => eq(userRole.userId, userId),
    with: {
      role: {
        with: {
          rolePermissions: { with: { permission: true } },
        },
      },
    },
  });

  const roles = rows.map((row) => row.role.name);
  const permissions = Array.from(
    new Set(
      rows.flatMap((row) =>
        row.role.rolePermissions.map((rp) => rp.permission.key),
      ),
    ),
  ) as Permission[];

  return { roles, permissions };
}
