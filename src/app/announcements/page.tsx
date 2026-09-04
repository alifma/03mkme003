import { ThemeToggle } from "@/components/theme-toggle";
import { PublicPostList } from "@/features/posts/components/public-post-list";

// See the matching comment in src/app/notes/page.tsx — same reasoning.
export const dynamic = "force-dynamic";

export default function PublicAnnouncementsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pengumuman</h1>
          <p className="text-muted-foreground mt-1">
            Login untuk baca detail pengumuman.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <div className="mt-6">
        <PublicPostList type="announcement" />
      </div>
    </div>
  );
}
