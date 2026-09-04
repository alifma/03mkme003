"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const THEME_CHANGE_EVENT = "siber:theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  // Matches the default in src/app/layout.tsx's static className + inline
  // init script — keeps server and first-client-render output identical.
  return true;
}

/**
 * Toggles class="dark" on <html> and persists the choice to localStorage.
 * Affects everywhere using the shared design tokens (dashboard, login,
 * /notes, /announcements) — NOT the homepage, which keeps its own fixed
 * dark hero.
 *
 * Uses useSyncExternalStore (not useState+useEffect) since the "state" here
 * genuinely lives outside React, in the DOM's classList — this is exactly
 * what that hook is for, and avoids the setState-in-effect footgun.
 */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label="Toggle dark/light theme"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
