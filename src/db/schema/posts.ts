import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// "note" = materi pelajaran, "announcement" = pengumuman. Same shape for
// both — split by `type`, not by table — since they're identical in every
// way that matters (title, excerpt, markdown content, public teaser vs
// login-gated full view).
export const postType = pgEnum("post_type", ["note", "announcement"]);
export type PostType = (typeof postType.enumValues)[number];

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: postType("type").notNull(),
  title: text("title").notNull(),
  // Shown on the PUBLIC list (/notes, /announcements) — never the full
  // content. Falls back to a truncated `content` at render time if empty.
  excerpt: text("excerpt"),
  content: text("content").notNull(), // markdown, only rendered behind login
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
