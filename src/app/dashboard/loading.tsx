import { SiberSpinner } from "@/components/siber-spinner";

// Route-level fallback, shown automatically by Next.js only while a
// /dashboard/* page hasn't produced ANY output yet (e.g. its `auth()` call
// is still resolving) — rendered inside dashboard/layout.tsx's <main> slot,
// so the sidebar/topbar stay visible. Each list page now renders its own
// heading immediately and wraps only its table in a nested <Suspense>
// (see e.g. dashboard/kas/page.tsx), so in practice this whole-content
// fallback rarely shows once a page has loaded once — that inner one does.
export default function DashboardLoading() {
  return <SiberSpinner />;
}
