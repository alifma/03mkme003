import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * A role is just a named bundle of permissions (see permissions.ts).
 * Application code never checks role names directly — it checks permissions.
 */
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // e.g. "admin", "editor", "viewer"
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (ur) => [primaryKey({ columns: [ur.userId, ur.roleId] })],
);
