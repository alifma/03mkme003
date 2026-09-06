import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * An uploaded file (PPT, PDF, image, ...). Bytes live on disk under
 * `UPLOAD_DIR` keyed by `storageKey`; this table is metadata only. Files are
 * served by `GET /api/files/[id]` (login-gated) and referenced from Markdown
 * post content as `/api/files/<id>` — see `src/features/files/`.
 */
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Original name as uploaded — shown in the UI and used for the download
  // filename. Not a path; never used to build one.
  filename: text("filename").notNull(),
  // Relative path within UPLOAD_DIR, e.g. "ab/cd/<uuid>.pptx". Generated
  // server-side, always the source of truth for locating the bytes.
  storageKey: text("storage_key").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // bytes
  uploadedBy: uuid("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
