import { auth } from "@/features/auth/config";
import { HomeContent } from "@/features/home/components/home-content";
import { listPostsPublic } from "@/features/posts/queries";

// Public — intentionally NOT gated by proxy.ts (see src/proxy.ts), so it
// renders the same whether the visitor is signed in or not.
export default async function HomePage() {
  const session = await auth();
  const latestAnnouncements = (await listPostsPublic("announcement")).slice(
    0,
    3,
  );

  return (
    <HomeContent
      ctaHref={session ? "/dashboard" : "/login"}
      ctaLabel={session ? "Go to dashboard" : "Sign in"}
      announcements={latestAnnouncements}
    />
  );
}
