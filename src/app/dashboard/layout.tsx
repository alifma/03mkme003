import { redirect } from "next/navigation";
import { auth, signOut } from "@/features/auth/config";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { NAV_ITEMS } from "@/features/dashboard/nav-items";
import { can } from "@/features/rbac/can";

// proxy.ts already redirects unauthenticated visitors away from /dashboard,
// but a layout-level check is kept here too — never rely on the route
// gate alone (see the comment in src/proxy.ts).
//
// The actual shell (collapsible sidebar, topbar, theme toggle) lives in
// DashboardShell — a Client Component, since the collapse state needs
// React state shared between the <aside> and its topbar toggle button.
// This layout stays a Server Component and just hands it data + the
// sign-out <form> (a Server Action) as a pre-rendered prop.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const items = NAV_ITEMS.filter((item) => can(session, item.permission));

  return (
    <DashboardShell
      items={items}
      userEmail={session.user.email ?? ""}
      signOutForm={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="hover:text-foreground">
            Sign out
          </button>
        </form>
      }
    >
      {children}
    </DashboardShell>
  );
}
