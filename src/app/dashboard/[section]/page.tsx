import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { SiberSpinner } from "@/components/siber-spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/features/auth/config";
import { can } from "@/features/rbac/can";
import { deletePostAction } from "@/features/posts/actions";
import { POST_PERMISSIONS } from "@/features/posts/permissions";
import { listPosts } from "@/features/posts/queries";
import { labelFor, sectionToType } from "@/features/posts/section";
import { formatDate } from "@/lib/format";
import type { PostType } from "@/db/schema";
import type { Session } from "next-auth";

export default async function PostListPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const type = sectionToType(section);
  if (!type) notFound();

  const perms = POST_PERMISSIONS[type];
  const rawSession = await auth();
  if (!can(rawSession, perms.read)) notFound();
  // `can()` returning true guarantees a real session.
  const session = rawSession!;

  const canCreate = can(session, perms.create);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{labelFor(type)}</h1>
        {canCreate && (
          <Button
            nativeButton={false}
            render={
              <Link href={`/dashboard/${section}/new`}>
                New {type === "note" ? "note" : "announcement"}
              </Link>
            }
          />
        )}
      </div>

      <Suspense
        fallback={
          <SiberSpinner label={`Loading ${labelFor(type)}`} minHeight="16rem" />
        }
      >
        <PostTable type={type} section={section} session={session} />
      </Suspense>
    </div>
  );
}

async function PostTable({
  type,
  section,
  session,
}: {
  type: PostType;
  section: string;
  session: Session;
}) {
  const perms = POST_PERMISSIONS[type];
  const items = await listPosts(type);
  const canUpdate = can(session, perms.update);
  const canDelete = can(session, perms.delete);
  const showActions = canUpdate || canDelete;

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Date</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link
                href={`/dashboard/${section}/${item.id}`}
                className="font-medium hover:underline"
              >
                {item.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.author?.name ?? item.author?.email ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(item.createdAt)}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex justify-end gap-1">
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/${section}/${item.id}/edit`} />
                      }
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  )}
                  {canDelete && (
                    <ConfirmDeleteButton
                      title={`Delete this ${type}?`}
                      description="This can't be undone."
                      action={deletePostAction.bind(null, type, item.id)}
                    />
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-muted-foreground text-center"
            >
              Nothing here yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
