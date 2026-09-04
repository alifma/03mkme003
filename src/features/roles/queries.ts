import { db } from "@/db";

export async function listRoles() {
  const rows = await db.query.roles.findMany({
    with: {
      rolePermissions: { with: { permission: true } },
      userRoles: { columns: { userId: true } },
    },
    orderBy: (role, { asc }) => [asc(role.name)],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: row.rolePermissions.map((rp) => rp.permission.key),
    userCount: row.userRoles.length,
  }));
}

/** Minimal shape for the role-checkbox list on the user create/edit form. */
export async function listRolesForSelect() {
  return db.query.roles.findMany({
    columns: { id: true, name: true },
    orderBy: (role, { asc }) => [asc(role.name)],
  });
}
