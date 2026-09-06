import { db } from "@/db";

export async function listAttachments() {
  return db.query.attachments.findMany({
    with: {
      uploadedByUser: { columns: { name: true, email: true } },
    },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
  });
}

export async function getAttachmentById(id: string) {
  return db.query.attachments.findFirst({
    where: (a, { eq }) => eq(a.id, id),
  });
}
