import { db } from "@/db";

export async function getOwnProfile(userId: string) {
  const row = await db.query.users.findFirst({
    columns: { id: true, name: true, username: true, email: true },
    where: (u, { eq }) => eq(u.id, userId),
    with: {
      userRoles: { with: { role: { columns: { name: true } } } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    roles: row.userRoles.map((ur) => ur.role.name),
  };
}
