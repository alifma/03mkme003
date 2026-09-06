import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiberSpinner } from "@/components/siber-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { env } from "@/config/env";
import { auth } from "@/features/auth/config";
import { deleteAttachmentAction } from "@/features/files/actions";
import { CopyLinkButton } from "@/features/files/components/copy-link-button";
import { FileUploader } from "@/features/files/components/file-uploader";
import { listAttachments } from "@/features/files/queries";
import { can } from "@/features/rbac/can";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { formatBytes, formatDate } from "@/lib/format";

export default async function FilesPage() {
  const session = await auth();
  if (!can(session, PERMISSIONS.FILES_READ)) notFound();

  const canUpload = can(session, PERMISSIONS.FILES_UPLOAD);
  const canDelete = can(session, PERMISSIONS.FILES_DELETE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload lecture material (PPT, PDF, images) and reference it from notes
          or announcements with its link.
        </p>
      </div>

      {canUpload && <FileUploader maxUploadMb={env.MAX_UPLOAD_MB} />}

      <Suspense
        fallback={<SiberSpinner label="Loading files" minHeight="16rem" />}
      >
        <FileTable canDelete={canDelete} />
      </Suspense>
    </div>
  );
}

async function FileTable({ canDelete }: { canDelete: boolean }) {
  const files = await listAttachments();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Uploaded by</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const href = `/api/files/${file.id}`;
          return (
            <TableRow key={file.id}>
              <TableCell>
                <Link
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline"
                >
                  {file.filename}
                </Link>
                <span className="text-muted-foreground ml-2 text-xs uppercase">
                  {file.mimeType.split("/").pop()}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatBytes(file.size)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {file.uploadedByUser?.name ?? file.uploadedByUser?.email ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(file.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <CopyLinkButton path={href} />
                  {canDelete && (
                    <ConfirmDeleteButton
                      title="Delete this file?"
                      description="Links to it in existing posts will stop working."
                      action={deleteAttachmentAction.bind(null, file.id)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {files.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground text-center"
            >
              No files yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
