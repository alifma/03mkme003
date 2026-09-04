import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostType } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { listPostsPublic } from "../queries";
import { typeToSection } from "../section";

// Public teaser — title, excerpt, date only. The "read more" link goes
// straight to the /dashboard/... detail route, which proxy.ts already
// redirects to /login for anyone without a session. No separate gating
// logic needed here.
export async function PublicPostList({ type }: { type: PostType }) {
  const items = await listPostsPublic(type);
  const section = typeToSection(type);

  if (items.length === 0) {
    return <p className="text-muted-foreground">Belum ada apa-apa di sini.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-base">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {item.excerpt || "Login untuk baca selengkapnya."}
            </p>
            <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
              <span>{formatDate(item.createdAt)}</span>
              <Link
                href={`/dashboard/${section}/${item.id}`}
                className="text-primary font-medium hover:underline"
              >
                Login untuk baca →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
