import { SiberSpinner } from "@/components/siber-spinner";

// Covers the public routes (/login, /notes, /announcements) — /dashboard/*
// has its own loading.tsx that only replaces the content area, not the
// whole shell.
export default function RootLoading() {
  return <SiberSpinner />;
}
