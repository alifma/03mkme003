import type { PostType } from "@/db/schema";

// Maps the URL segment (/dashboard/notes, /dashboard/announcements) to the
// underlying post type. Notes and announcements are otherwise identical in
// shape and behavior — this is the only place that distinguishes the route.
const SECTION_TO_TYPE: Record<string, PostType> = {
  notes: "note",
  announcements: "announcement",
};

const TYPE_TO_LABEL: Record<PostType, string> = {
  note: "Notes",
  announcement: "Announcements",
};

const TYPE_TO_SECTION: Record<PostType, string> = {
  note: "notes",
  announcement: "announcements",
};

export function sectionToType(section: string): PostType | null {
  return SECTION_TO_TYPE[section] ?? null;
}

export function typeToSection(type: PostType): string {
  return TYPE_TO_SECTION[type];
}

export function labelFor(type: PostType): string {
  return TYPE_TO_LABEL[type];
}
