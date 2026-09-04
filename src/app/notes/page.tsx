import { ThemeToggle } from "@/components/theme-toggle";
import { PublicPostList } from "@/features/posts/components/public-post-list";

// Otherwise Next statically prerenders this at build time (no auth()/cookies
// call to opt it into dynamic rendering the way every other page here gets
// automatically) — which queries the DB during `next build`. Harmless
// locally (a real DATABASE_URL is available), but breaks the Docker build,
// which deliberately uses placeholder DB creds at build time (see
// docker/Dockerfile). Also just correct behavior regardless: this list
// should always be live, never a stale build-time snapshot.
export const dynamic = "force-dynamic";

export default function PublicNotesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Notes Pelajaran</h1>
          <p className="text-muted-foreground mt-1">
            Daftar materi yang tersedia. Login untuk baca isinya.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <div className="mt-6">
        <PublicPostList type="note" />
      </div>
    </div>
  );
}
