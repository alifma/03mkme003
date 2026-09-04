import { notFound } from "next/navigation";
import { auth } from "@/features/auth/config";
import { can } from "@/features/rbac/can";
import { MarkdownContent } from "@/features/posts/components/markdown-content";
import { POST_PERMISSIONS } from "@/features/posts/permissions";
import { getPostById } from "@/features/posts/queries";
import { sectionToType } from "@/features/posts/section";
import { formatDate } from "@/lib/format";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section, id } = await params;
  const type = sectionToType(section);
  if (!type) notFound();

  const session = await auth();
  if (!can(session, POST_PERMISSIONS[type].read)) notFound();

  const post = await getPostById(id);
  if (!post || post.type !== type) notFound();

  return (
    <article>
      <h1 className="text-2xl font-semibold">{post.title}</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {post.author?.name ?? post.author?.email ?? "Unknown"} ·{" "}
        {formatDate(post.createdAt)}
      </p>
      <div className="mt-6">
        <MarkdownContent content={post.content} />
      </div>
    </article>
  );
}
