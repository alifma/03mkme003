import { PERMISSIONS, type Permission } from "@/features/rbac/permissions";

// Icon is a string key, not a component reference — this array is filtered
// in a Server Component (dashboard/layout.tsx) and the result is passed as
// props into Client Components (SidebarNav/MobileNav). React component
// references aren't serializable across that boundary; the client side
// resolves the key to an actual icon via ICONS in sidebar-nav.tsx.
export type NavIcon =
  "dashboard" | "users" | "roles" | "notes" | "announcements" | "kas";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  permission: Permission;
}

/**
 * Sidebar menu. Each item is gated by a permission — items the current
 * session lacks are filtered out before rendering (see dashboard/layout.tsx).
 * This is UX only, not a security boundary: the routes/actions behind these
 * links still enforce their own permission via requirePermission().
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "dashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: "notes",
    permission: PERMISSIONS.NOTES_READ,
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    icon: "announcements",
    permission: PERMISSIONS.ANNOUNCEMENTS_READ,
  },
  {
    label: "Kas",
    href: "/dashboard/kas",
    icon: "kas",
    permission: PERMISSIONS.KAS_READ,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: "users",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    icon: "roles",
    permission: PERMISSIONS.ROLES_READ,
  },
];
