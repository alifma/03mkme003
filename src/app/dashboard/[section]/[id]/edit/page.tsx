import { notFound } from "next/navigation";
import { auth } from "@/features/auth/config";
import { can } from "@/features/rbac/can";
import { updatePostAction } from "@/features/posts/actions";
import { PostForm } from "@/features/posts/components/post-form";
import { POST_PERMISSIONS } from "@/features/posts/permissions";
import { getPostById } from "@/features/posts/queries";
import { sectionToType } from "@/features/posts/section";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section, id } = await params;
  const type = sectionToType(section);
  if (!type) notFound();

  const session = await auth();
  if (!can(session, POST_PERMISSIONS[type].update)) notFound();

  const post = await getPostById(id);
  if (!post || post.type !== type) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Edit {type === "note" ? "note" : "announcement"}
      </h1>
      <div className="mt-4">
        <PostForm
          action={updatePostAction.bind(null, type, id)}
          defaultValues={{
            title: post.title,
            excerpt: post.excerpt ?? "",
            content: post.content,
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
