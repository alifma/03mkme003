import { relations } from "drizzle-orm";
import { attachments } from "./attachments";
import { kasTransactions } from "./kas";
import { permissions, rolePermissions } from "./permissions";
import { posts } from "./posts";
import { roles, userRoles } from "./roles";
import { accounts, sessions, users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userRoles: many(userRoles),
  posts: many(posts),
  kasTransactionsFor: many(kasTransactions, {
    relationName: "kasTransactionUser",
  }),
  kasTransactionsCreated: many(kasTransactions, {
    relationName: "kasTransactionCreatedBy",
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

export const kasTransactionsRelations = relations(
  kasTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [kasTransactions.userId],
      references: [users.id],
      relationName: "kasTransactionUser",
    }),
    createdByUser: one(users, {
      fields: [kasTransactions.createdBy],
      references: [users.id],
      relationName: "kasTransactionCreatedBy",
    }),
  }),
);
