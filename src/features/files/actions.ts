"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { requirePermission } from "@/features/rbac/guard";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { resolveStoragePath } from "./storage";

export interface FileActionState {
  error?: string;
}

export async function deleteAttachmentAction(
  id: string,
): Promise<FileActionState | void> {
  await requirePermission(PERMISSIONS.FILES_DELETE);

  const row = await db.query.attachments.findFirst({
    where: (a, { eq: eqOp }) => eqOp(a.id, id),
  });
  if (!row) return;

  await db.delete(attachments).where(eq(attachments.id, id));

  // Best-effort — a missing file on disk shouldn't block removing the row.
  // Links to /api/files/<id> in existing post content will now 404.
  try {
    await unlink(resolveStoragePath(row.storageKey));
  } catch {
    // already gone
  }

  revalidatePath("/dashboard/files");
}
