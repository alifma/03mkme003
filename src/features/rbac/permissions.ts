/**
 * Canonical list of permission keys, "<resource>:<action>". This is the
 * single source of truth for both the seed script (which writes these rows
 * into the `permissions` table) and app code (which checks against them via
 * `can()` / `assertPermission()` in ./can.ts and ./guard.ts).
 *
 * Adding a new permission: add the const here, add it to a role's set in
 * `src/db/seed.ts`, re-run the seed.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",

  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",

  ROLES_CREATE: "roles:create",
  ROLES_READ: "roles:read",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",

  NOTES_CREATE: "notes:create",
  NOTES_READ: "notes:read",
  NOTES_UPDATE: "notes:update",
  NOTES_DELETE: "notes:delete",

  ANNOUNCEMENTS_CREATE: "announcements:create",
  ANNOUNCEMENTS_READ: "announcements:read",
  ANNOUNCEMENTS_UPDATE: "announcements:update",
  ANNOUNCEMENTS_DELETE: "announcements:delete",

  KAS_CREATE: "kas:create",
  KAS_READ: "kas:read",
  KAS_UPDATE: "kas:update",
  KAS_DELETE: "kas:delete",

  FILES_READ: "files:read",
  FILES_UPLOAD: "files:upload",
  FILES_DELETE: "files:delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/** Permissions grouped by resource — used to render the permission-checkbox
 * matrix on the role create/edit form. */
export const PERMISSION_GROUPS: {
  resource: string;
  permissions: Permission[];
}[] = [
  { resource: "Dashboard", permissions: [PERMISSIONS.DASHBOARD_VIEW] },
  {
    resource: "Users",
    permissions: [
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
    ],
  },
  {
    resource: "Roles",
    permissions: [
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_READ,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.ROLES_DELETE,
    ],
  },
  {
    resource: "Notes",
    permissions: [
      PERMISSIONS.NOTES_CREATE,
      PERMISSIONS.NOTES_READ,
      PERMISSIONS.NOTES_UPDATE,
      PERMISSIONS.NOTES_DELETE,
    ],
  },
  {
    resource: "Announcements",
    permissions: [
      PERMISSIONS.ANNOUNCEMENTS_CREATE,
      PERMISSIONS.ANNOUNCEMENTS_READ,
      PERMISSIONS.ANNOUNCEMENTS_UPDATE,
      PERMISSIONS.ANNOUNCEMENTS_DELETE,
    ],
  },
  {
    resource: "Kas",
    permissions: [
      PERMISSIONS.KAS_CREATE,
      PERMISSIONS.KAS_READ,
      PERMISSIONS.KAS_UPDATE,
      PERMISSIONS.KAS_DELETE,
    ],
  },
  {
    resource: "Files",
    permissions: [
      PERMISSIONS.FILES_READ,
      PERMISSIONS.FILES_UPLOAD,
      PERMISSIONS.FILES_DELETE,
    ],
  },
];
