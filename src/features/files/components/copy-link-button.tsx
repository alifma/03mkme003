"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Copies an absolute URL for `path` (resolved against the current origin)
 * to the clipboard — handy for pasting a file link into a post. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      const url = new URL(path, window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — nothing useful to do
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label="Copy link"
    >
      {copied ? (
        <Check className="text-primary size-4" />
      ) : (
        <Link2 className="size-4" />
      )}
    </Button>
  );
}
