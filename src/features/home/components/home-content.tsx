"use client";

import { motion } from "framer-motion";
import { Lock, Shield, ShieldCheck, Terminal } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

interface AnnouncementTeaser {
  id: string;
  title: string;
  excerpt: string | null;
  createdAt: Date;
}

// Decorative — purely visual, no data. Positions/sizes are hand-picked so
// nothing overlaps the centered content column.
const FLOATING_ICONS = [
  { Icon: Shield, top: "12%", left: "8%", size: 26, duration: 5 },
  { Icon: Lock, top: "20%", left: "88%", size: 20, duration: 6 },
  { Icon: ShieldCheck, top: "72%", left: "6%", size: 22, duration: 5.5 },
  { Icon: Shield, top: "82%", left: "90%", size: 18, duration: 4.5 },
  { Icon: Terminal, top: "48%", left: "93%", size: 18, duration: 6.5 },
  { Icon: Lock, top: "55%", left: "3%", size: 16, duration: 5 },
];

// Client Component — the page itself (src/app/page.tsx) stays a Server
// Component that fetches data; this just receives plain, serializable props
// and owns the theme/animation. This section deliberately runs its own fixed
// dark aesthetic (03MKME003 — Cyber Security) independent of the rest of the
// site's light-by-default theme, using hand-set zinc/cyan colors rather than
// the shared design-token classes (text-muted-foreground etc.) used
// everywhere else in the app.
export function HomeContent({
  ctaHref,
  ctaLabel,
  announcements,
}: {
  ctaHref: string;
  ctaLabel: string;
  announcements: AnnouncementTeaser[];
}) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#03050a] text-zinc-100">
      {/* animated grid */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "44px 44px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* ambient glow behind the hero */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* scanning line sweeping top to bottom */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />

      {/* floating shield/lock icons */}
      {FLOATING_ICONS.map(({ Icon, top, left, size, duration }, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute text-cyan-400/15"
          style={{ top, left }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.div>
      ))}

      <div className="relative mx-auto flex max-w-2xl flex-col gap-14 px-6 py-20">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="relative mb-5 flex size-16 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/5"
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-cyan-400/40"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <ShieldCheck className="size-8 text-cyan-400" strokeWidth={1.5} />
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mb-3 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 font-mono text-xs tracking-widest text-cyan-400"
          >
            03MKME003 // CYBER SECURITY
          </motion.span>

          <h1 className="text-4xl font-bold tracking-tight text-white">
            SIBER<span className="text-cyan-400">_</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Materi pelajaran, pengumuman, dan kas kelas — semuanya di satu
            tempat.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-7"
          >
            <Link
              href={ctaHref}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/20"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span className="relative">{ctaLabel}</span>
            </Link>
          </motion.div>
        </motion.header>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex justify-center gap-8 font-mono text-xs text-zinc-500"
        >
          <Link href="/notes" className="transition-colors hover:text-cyan-400">
            &gt; notes_pelajaran
          </Link>
          <Link
            href="/announcements"
            className="transition-colors hover:text-cyan-400"
          >
            &gt; pengumuman
          </Link>
        </motion.nav>

        <section>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4 flex items-center gap-3 font-mono text-xs tracking-widest text-zinc-500 uppercase"
          >
            <span className="h-px flex-1 bg-zinc-800" />
            Pengumuman Terbaru
            <span className="h-px flex-1 bg-zinc-800" />
          </motion.h2>

          <div className="space-y-3">
            {announcements.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-center text-sm text-zinc-600"
              >
                Belum ada pengumuman.
              </motion.p>
            )}
            {announcements.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.55 + i * 0.1,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                whileHover={{ y: -2 }}
                className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm transition-colors hover:border-cyan-400/40"
              >
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-4 shrink-0 text-cyan-400/70 transition-colors group-hover:text-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-zinc-100">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.excerpt || "Login untuk baca selengkapnya."}
                    </p>
                    <p className="mt-2 font-mono text-xs text-zinc-600">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
