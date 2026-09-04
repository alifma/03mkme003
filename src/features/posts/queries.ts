import { db } from "@/db";
import type { PostType } from "@/db/schema";

/** Public teaser list — title + excerpt + date only, never full content. */
export async function listPostsPublic(type: PostType) {
  return db.query.posts.findMany({
    where: (p, { eq }) => eq(p.type, type),
    columns: { id: true, title: true, excerpt: true, createdAt: true },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
}

/** Full list for the dashboard — still no content (list view), just enough
 * to render a table with author/date and link through to the full page. */
export async function listPosts(type: PostType) {
  return db.query.posts.findMany({
    where: (p, { eq }) => eq(p.type, type),
    columns: { id: true, title: true, createdAt: true, updatedAt: true },
    with: { author: { columns: { name: true, email: true } } },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
}

export async function getPostById(id: string) {
  return db.query.posts.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: { author: { columns: { name: true, email: true } } },
  });
}
