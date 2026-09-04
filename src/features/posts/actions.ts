"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posts } from "@/db/schema";
import type { PostType } from "@/db/schema";
import { requirePermission } from "@/features/rbac/guard";
import {
  dashboardPathFor,
  POST_PERMISSIONS,
  publicPathFor,
} from "./permissions";
import { postSchema, type PostInput } from "./schema";

export interface PostActionState {
  error?: string;
}

export async function createPostAction(
  type: PostType,
  input: PostInput,
): Promise<PostActionState | void> {
  const session = await requirePermission(POST_PERMISSIONS[type].create);

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data" };

  await db.insert(posts).values({
    type,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt || null,
    content: parsed.data.content,
    authorId: session.user.id,
  });

  revalidatePath(dashboardPathFor(type));
  revalidatePath(publicPathFor(type));
  redirect(dashboardPathFor(type));
}

export async function updatePostAction(
  type: PostType,
  id: string,
  input: PostInput,
): Promise<PostActionState | void> {
  await requirePermission(POST_PERMISSIONS[type].update);

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data" };

  await db
    .update(posts)
    .set({
      title: parsed.data.title,
      excerpt: parsed.data.excerpt || null,
      content: parsed.data.content,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  revalidatePath(dashboardPathFor(type));
  revalidatePath(`${dashboardPathFor(type)}/${id}`);
  revalidatePath(publicPathFor(type));
  redirect(dashboardPathFor(type));
}

export async function deletePostAction(
  type: PostType,
  id: string,
): Promise<PostActionState | void> {
  await requirePermission(POST_PERMISSIONS[type].delete);
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath(dashboardPathFor(type));
  revalidatePath(publicPathFor(type));
}
