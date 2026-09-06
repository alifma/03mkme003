export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  isImage: boolean;
}

/** POSTs one file to the upload route. Throws with the server's message on
 * failure so callers can surface it directly. */
export async function uploadFile(file: File): Promise<UploadedFile> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/uploads", { method: "POST", body });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(detail?.error ?? `Upload failed (${res.status})`);
  }
  return (await res.json()) as UploadedFile;
}

/** Markdown snippet to reference an uploaded file: inline image, or a link
 * (with a paperclip) for everything else. */
export function markdownFor(file: UploadedFile): string {
  return file.isImage
    ? `\n![${file.filename}](${file.url})\n`
    : `\n[📎 ${file.filename}](${file.url})\n`;
}
