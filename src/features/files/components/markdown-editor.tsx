"use client";

import { Paperclip } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markdownFor, uploadFile } from "../upload-client";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  rows?: number;
  maxUploadMb: number;
}

/**
 * Markdown `<textarea>` with GitLab-style attachments: drag a file onto it,
 * paste one, or use the button. Each upload hits `/api/uploads` and the
 * resulting `/api/files/<id>` reference is inserted at the cursor.
 */
export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  id,
  rows = 16,
  maxUploadMb,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    // Restore focus + caret after React re-renders with the new value.
    queueMicrotask(() => {
      const node = textareaRef.current;
      if (!node) return;
      const caret = start + snippet.length;
      node.focus();
      node.setSelectionRange(caret, caret);
    });
  }

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
        insertAtCursor(markdownFor(await uploadFile(file)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-3.5" />
          {busy ? "Uploading…" : "Attach file"}
        </Button>
        <span className="text-muted-foreground text-xs">
          or drag &amp; drop / paste into the box · max {maxUploadMb} MB
        </span>
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        className={
          dragging
            ? "border-primary ring-ring/50 font-mono ring-3"
            : "font-mono"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
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
        onPaste={(e) => {
          if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            void handleFiles(e.clipboardData.files);
          }
        }}
      />

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
