"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavItem } from "../nav-items";
import { MobileNav } from "./mobile-nav";
import { SidebarNav } from "./sidebar-nav";

const SIDEBAR_WIDTH = 224; // px, matches the old w-56
const SIDEBAR_COLLAPSED_WIDTH = 64; // px — icon rail, not fully hidden

/**
 * Owns the collapse state, so it needs to be one client component wrapping
 * both the <aside> and the topbar toggle button (they can't share React
 * state across separate server-rendered slots). `signOutForm` is a
 * pre-rendered server action <form> passed through as a prop from the
 * Server Component layout — Client Components can render arbitrary
 * Server-rendered children/props without needing to "understand" them.
 *
 * "Collapsed" shrinks to an icon-only rail (SIDEBAR_COLLAPSED_WIDTH), not to
 * zero — nav items stay reachable (with a hover/focus tooltip via `title`,
 * see SidebarNav) rather than disappearing entirely.
 *
 * State resets to open on a full page reload, but survives client-side
 * navigation within /dashboard/* (this layout stays mounted across route
 * changes) — no localStorage/flash-prevention plumbing needed for that.
 */
export function DashboardShell({
  items,
  userEmail,
  signOutForm,
  children,
}: {
  items: NavItem[];
  userEmail: string;
  signOutForm: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-background text-foreground flex min-h-svh">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="border-border hidden shrink-0 overflow-hidden border-r md:block"
      >
        <div
          className={`border-border flex h-14 items-center gap-2 border-b ${collapsed ? "justify-center px-0" : "px-4"}`}
        >
          <ShieldCheck
            className="text-primary size-4 shrink-0"
            strokeWidth={1.75}
          />
          {!collapsed && (
            <span className="font-mono text-sm font-semibold tracking-wide whitespace-nowrap">
              SIBER<span className="text-primary">_</span>
            </span>
          )}
        </div>
        <SidebarNav items={items} collapsed={collapsed} />
      </motion.aside>

      <div className="flex flex-1 flex-col">
        <header className="border-border flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-1">
            <MobileNav items={items} />
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
            <span className="ml-2 font-mono text-sm font-semibold md:hidden">
              SIBER<span className="text-primary">_</span>
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <ThemeToggle />
            <span>{userEmail}</span>
            {signOutForm}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
