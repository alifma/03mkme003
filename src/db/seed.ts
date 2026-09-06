import { loadEnvConfig } from "@next/env";

// Standalone script — load .env* the same way Next.js does before touching
// anything that reads process.env (db client, our validated env module).
loadEnvConfig(process.cwd());

async function main() {
  const { notInArray } = await import("drizzle-orm");
  const { db } = await import("./index");
  const schema = await import("./schema");
  const { ALL_PERMISSIONS, PERMISSIONS } =
    await import("@/features/rbac/permissions");
  const { hashPassword } = await import("@/features/auth/password");

  const PERMISSION_DESCRIPTIONS: Record<string, string> = {
    [PERMISSIONS.DASHBOARD_VIEW]: "View the dashboard",
    [PERMISSIONS.USERS_CREATE]: "Create users",
    [PERMISSIONS.USERS_READ]: "View users",
    [PERMISSIONS.USERS_UPDATE]: "Edit users",
    [PERMISSIONS.USERS_DELETE]: "Delete users",
    [PERMISSIONS.ROLES_CREATE]: "Create roles",
    [PERMISSIONS.ROLES_READ]: "View roles",
    [PERMISSIONS.ROLES_UPDATE]: "Edit roles",
    [PERMISSIONS.ROLES_DELETE]: "Delete roles",
    [PERMISSIONS.NOTES_CREATE]: "Create notes",
    [PERMISSIONS.NOTES_READ]: "Read notes",
    [PERMISSIONS.NOTES_UPDATE]: "Edit notes",
    [PERMISSIONS.NOTES_DELETE]: "Delete notes",
    [PERMISSIONS.ANNOUNCEMENTS_CREATE]: "Create announcements",
    [PERMISSIONS.ANNOUNCEMENTS_READ]: "Read announcements",
    [PERMISSIONS.ANNOUNCEMENTS_UPDATE]: "Edit announcements",
    [PERMISSIONS.ANNOUNCEMENTS_DELETE]: "Delete announcements",
    [PERMISSIONS.KAS_CREATE]: "Record kas transactions",
    [PERMISSIONS.KAS_READ]: "View kas transactions",
    [PERMISSIONS.KAS_UPDATE]: "Edit kas transactions",
    [PERMISSIONS.KAS_DELETE]: "Delete kas transactions",
    [PERMISSIONS.FILES_READ]: "View and download uploaded files",
    [PERMISSIONS.FILES_UPLOAD]: "Upload files",
    [PERMISSIONS.FILES_DELETE]: "Delete uploaded files",
  };

  // Roles are just rows in the `roles` table — there's no fixed set of them;
  // create more via `pnpm db:studio` or by extending this map.
  // - admin: everything.
  // - member: every classmate gets this — can read notes/announcements/kas
  //   and see the class roster once logged in, but can't create/edit/delete
  //   anything (that's admin-only, keeps official content one-way/controlled).
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: ALL_PERMISSIONS,
    member: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.NOTES_READ,
      PERMISSIONS.ANNOUNCEMENTS_READ,
      PERMISSIONS.KAS_READ,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.FILES_READ,
    ],
  };

  console.log("Seeding permissions...");
  const permissionRows = await Promise.all(
    ALL_PERMISSIONS.map(async (key) => {
      const [row] = await db
        .insert(schema.permissions)
        .values({ key, description: PERMISSION_DESCRIPTIONS[key] })
        .onConflictDoUpdate({
          target: schema.permissions.key,
          set: { description: PERMISSION_DESCRIPTIONS[key] },
        })
        .returning();
      return row;
    }),
  );
  const permissionIdByKey = new Map(permissionRows.map((p) => [p.key, p.id]));

  // Prune permissions that no longer exist in PERMISSIONS (e.g. renamed
  // "users:write" -> "users:create"/"users:update") — cascades to
  // role_permissions automatically.
  await db
    .delete(schema.permissions)
    .where(notInArray(schema.permissions.key, ALL_PERMISSIONS));

  console.log("Seeding roles...");
  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const [role] = await db
      .insert(schema.roles)
      .values({ name: roleName })
      .onConflictDoUpdate({
        target: schema.roles.name,
        set: { name: roleName },
      })
      .returning();

    for (const key of permissionKeys) {
      const permissionId = permissionIdByKey.get(key);
      if (!permissionId) continue;
      await db
        .insert(schema.rolePermissions)
        .values({ roleId: role.id, permissionId })
        .onConflictDoNothing();
    }
  }

  console.log("Seeding admin user...");
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hashPassword(adminPassword);

  const [adminUser] = await db
    .insert(schema.users)
    .values({
      username: adminUsername,
      email: adminEmail,
      name: "Admin",
      passwordHash,
    })
    .onConflictDoNothing({ target: schema.users.email })
    .returning();

  const admin =
    adminUser ??
    (await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, adminEmail),
    }));
  const adminRole = await db.query.roles.findFirst({
    where: (r, { eq }) => eq(r.name, "admin"),
  });

  if (admin && adminRole) {
    await db
      .insert(schema.userRoles)
      .values({ userId: admin.id, roleId: adminRole.id })
      .onConflictDoNothing();
  }

  console.log(
    `Done. Admin login: ${adminUsername} / ${adminUser ? adminPassword : "(existing user — password unchanged)"}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
