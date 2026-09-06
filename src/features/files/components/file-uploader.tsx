"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "../upload-client";

/**
 * Standalone dropzone for the Files library page. Uploads run against the
 * same `/api/uploads` route; on success we `router.refresh()` so the server
 * component re-renders the table.
 */
export function FileUploader({ maxUploadMb }: { maxUploadMb: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0 || busy) return;

    setBusy(true);
    setError(null);
    try {
      for (const file of list) {
        if (file.size > maxUploadMb * 1024 * 1024) {
          throw new Error(`${file.name} — max ${maxUploadMb} MB`);
        }
        await uploadFile(file);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          setDragging(false);
          if (e.dataTransfer.files.length > 0) {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }
        }}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-sm transition-colors ${
          dragging
            ? "border-primary bg-accent/40"
            : "border-border text-muted-foreground hover:bg-accent/20"
        }`}
      >
        <Upload className="size-5" />
        {busy ? (
          "Uploading…"
        ) : (
          <>
            <span>
              <span className="text-foreground font-medium">
                Click to upload
              </span>{" "}
              or drag &amp; drop
            </span>
            <span className="text-xs">max {maxUploadMb} MB per file</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
  );
}
