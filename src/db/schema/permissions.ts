import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { roles } from "./roles";

/**
 * A permission is an atomic capability, keyed as "<resource>:<action>"
 * (e.g. "users:read", "users:write", "dashboard:view"). Keep this table as
 * the single source of truth — `src/features/rbac/permissions.ts` mirrors
 * these keys as a type-safe TS const for use in code.
 */
export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (rp) => [primaryKey({ columns: [rp.roleId, rp.permissionId] })],
);
