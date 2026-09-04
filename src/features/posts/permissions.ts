import type { PostType } from "@/db/schema";
import { PERMISSIONS, type Permission } from "@/features/rbac/permissions";

/** Maps a post's `type` to the permission namespace that gates it. */
export const POST_PERMISSIONS: Record<
  PostType,
  {
    create: Permission;
    read: Permission;
    update: Permission;
    delete: Permission;
  }
> = {
  note: {
    create: PERMISSIONS.NOTES_CREATE,
    read: PERMISSIONS.NOTES_READ,
    update: PERMISSIONS.NOTES_UPDATE,
    delete: PERMISSIONS.NOTES_DELETE,
  },
  announcement: {
    create: PERMISSIONS.ANNOUNCEMENTS_CREATE,
    read: PERMISSIONS.ANNOUNCEMENTS_READ,
    update: PERMISSIONS.ANNOUNCEMENTS_UPDATE,
    delete: PERMISSIONS.ANNOUNCEMENTS_DELETE,
  },
};

export function dashboardPathFor(type: PostType) {
  return type === "note" ? "/dashboard/notes" : "/dashboard/announcements";
}

export function publicPathFor(type: PostType) {
  return type === "note" ? "/notes" : "/announcements";
}
