import { db } from "@/db";

export async function listUsers() {
  const rows = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      username: true,
      email: true,
      createdAt: true,
    },
    with: {
      userRoles: { with: { role: { columns: { id: true, name: true } } } },
    },
    orderBy: (u, { asc }) => [asc(u.createdAt)],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    createdAt: row.createdAt,
    roles: row.userRoles.map((ur) => ur.role.name),
    roleIds: row.userRoles.map((ur) => ur.role.id),
  }));
}

/** Minimal shape for the "person" dropdown on the kas transaction form. */
export async function listUsersForSelect() {
  return db.query.users.findMany({
    columns: { id: true, name: true, username: true },
    orderBy: (u, { asc }) => [asc(u.name)],
  });
}
