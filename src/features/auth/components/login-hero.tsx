"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

// Theme (cyan-dark vs shadcn light) is controlled app-wide via class="dark"
// on <html> (see src/app/layout.tsx + components/theme-toggle.tsx) — no
// per-page dark class needed here anymore. The Card/form passed as
// `children` is a plain Server-rendered component; this just wraps it in the
// animated shell.
export function LoginHero({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground relative flex min-h-svh items-center justify-center overflow-hidden px-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex w-full max-w-sm flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="border-primary/30 bg-primary/5 relative mb-5 flex size-14 items-center justify-center rounded-full border"
        >
          <motion.span
            className="border-primary/40 absolute inset-0 rounded-full border"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <ShieldCheck className="text-primary size-7" strokeWidth={1.5} />
        </motion.div>

        <div className="w-full">{children}</div>
      </motion.div>
    </div>
  );
}
