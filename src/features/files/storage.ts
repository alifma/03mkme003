import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/config/env";

// Absolute root under which every uploaded file lives. Resolved once here so
// the rest of the module can assume it's absolute.
const UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR);

export const MAX_UPLOAD_BYTES = env.MAX_UPLOAD_MB * 1024 * 1024;

/**
 * Turns a stored `storageKey` back into an absolute path, refusing anything
 * that would escape UPLOAD_ROOT (`..`, absolute keys, symlink-ish tricks).
 * Keys we generate are always safe; this guards against a tampered DB row or
 * a future code path that forgets.
 */
export function resolveStoragePath(storageKey: string): string {
  const full = path.resolve(UPLOAD_ROOT, storageKey);
  if (full !== UPLOAD_ROOT && !full.startsWith(UPLOAD_ROOT + path.sep)) {
    throw new Error(`Storage key escapes upload root: ${storageKey}`);
  }
  return full;
}

/** Keep a short, filesystem-safe extension from the original filename. */
function safeExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,12}$/.test(ext) ? ext : "";
}

/**
 * Writes `file` to disk under a generated key and returns what the caller
 * needs to persist. Fans keys out into two levels of subdirectory so a
 * single directory never holds thousands of entries.
 */
export async function saveUpload(
  file: File,
): Promise<{ storageKey: string; size: number }> {
  const id = randomUUID();
  const storageKey = path.posix.join(
    id.slice(0, 2),
    id.slice(2, 4),
    `${id}${safeExtension(file.name)}`,
  );
  const dest = resolveStoragePath(storageKey);

  const bytes = Buffer.from(await file.arrayBuffer());
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, bytes);

  return { storageKey, size: bytes.length };
}
