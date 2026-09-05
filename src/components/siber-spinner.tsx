"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * Branded loading indicator.
 *
 * Two uses:
 *  - Full-page: route-level `loading.tsx` files, shown (in a Suspense
 *    boundary Next.js adds automatically) while an entire segment is still
 *    loading — e.g. the very first navigation into /dashboard.
 *  - Inline: dropped into a `<Suspense fallback={...}>` wrapped around just
 *    a table/data section, so the page's heading and static chrome render
 *    immediately and only that section shows the spinner. Pass a smaller
 *    `minHeight` (and a section-specific `label`) for this case.
 */
export function SiberSpinner({
  label = "Loading",
  minHeight = "50vh",
}: {
  label?: string;
  minHeight?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      style={{ minHeight }}
    >
      <div className="relative flex size-14 items-center justify-center">
        <motion.span
          className="border-primary/25 border-t-primary absolute inset-0 rounded-full border-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <ShieldCheck className="text-primary size-6" strokeWidth={1.75} />
      </div>
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
        {label}
      </p>
    </div>
  );
}
