import { notFound } from "next/navigation";
import { env } from "@/config/env";
import { auth } from "@/features/auth/config";
import { can } from "@/features/rbac/can";
import { createPostAction } from "@/features/posts/actions";
import { PostForm } from "@/features/posts/components/post-form";
import { POST_PERMISSIONS } from "@/features/posts/permissions";
import { sectionToType } from "@/features/posts/section";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const type = sectionToType(section);
  if (!type) notFound();

  const session = await auth();
  if (!can(session, POST_PERMISSIONS[type].create)) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        New {type === "note" ? "note" : "announcement"}
      </h1>
      <div className="mt-4">
        <PostForm
          action={createPostAction.bind(null, type)}
          maxUploadMb={env.MAX_UPLOAD_MB}
        />
      </div>
    </div>
  );
}
