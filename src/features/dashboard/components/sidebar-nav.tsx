"use client";

import { cn } from "cn";
import {
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  NotebookText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavIcon, NavItem } from "../nav-items";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  roles: ShieldCheck,
  notes: NotebookText,
  announcements: Megaphone,
  kas: Wallet,
  files: FolderOpen,
};

export function SidebarNav({
  items,
  onNavigate,
  collapsed = false,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  /** Icon-only rail — no labels. Only meaningful for the desktop sidebar;
   * MobileNav's Sheet never passes this (always shows full labels there). */
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md border-l-2 py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "px-3",
              active
                ? "border-primary bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground border-transparent",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
