import { db } from "@/db";
import { attachments } from "@/db/schema";
import { guardErrorResponse, requirePermission } from "@/features/rbac/guard";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { MAX_UPLOAD_BYTES, saveUpload } from "@/features/files/storage";

// Streams a file to disk — needs the Node runtime, and must not be treated
// as a cacheable route.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let session;
  try {
    session = await requirePermission(PERMISSIONS.FILES_UPLOAD);
  } catch (error) {
    const res = guardErrorResponse(error);
    if (res) return res;
    throw error;
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json(
      {
        error: `File too large — max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`,
      },
      { status: 413 },
    );
  }

  const { storageKey, size } = await saveUpload(file);

  const [row] = await db
    .insert(attachments)
    .values({
      filename: file.name.slice(0, 255) || "file",
      storageKey,
      mimeType: file.type || "application/octet-stream",
      size,
      uploadedBy: session.user.id,
    })
    .returning();

  return Response.json({
    id: row.id,
    filename: row.filename,
    url: `/api/files/${row.id}`,
    mimeType: row.mimeType,
    size: row.size,
    isImage: row.mimeType.startsWith("image/"),
  });
}
