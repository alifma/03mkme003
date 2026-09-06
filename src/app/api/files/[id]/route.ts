import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { getAttachmentById } from "@/features/files/queries";
import { guardErrorResponse, requirePermission } from "@/features/rbac/guard";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { resolveStoragePath } from "@/features/files/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PDFs and images render in the browser; everything else downloads.
function dispositionType(mimeType: string): "inline" | "attachment" {
  return mimeType.startsWith("image/") || mimeType === "application/pdf"
    ? "inline"
    : "attachment";
}

function contentDisposition(mimeType: string, filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `${dispositionType(mimeType)}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission(PERMISSIONS.FILES_READ);
  } catch (error) {
    const res = guardErrorResponse(error);
    if (res) return res;
    throw error;
  }

  const { id } = await params;
  const row = await getAttachmentById(id);
  if (!row) return new Response("Not found", { status: 404 });

  const filePath = resolveStoragePath(row.storageKey);
  let fileSize: number;
  try {
    fileSize = (await stat(filePath)).size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as NodeWebReadableStream<Uint8Array>;

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": row.mimeType,
      "Content-Length": String(fileSize),
      "Content-Disposition": contentDisposition(row.mimeType, row.filename),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
