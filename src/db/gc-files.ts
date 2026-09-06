import { loadEnvConfig } from "@next/env";

// Standalone script — mirrors seed.ts: load .env* the way Next.js does
// before importing anything that reads process.env.
loadEnvConfig(process.cwd());

// Usage:
//   pnpm files:gc                              dry run — list orphaned uploads
//   pnpm files:gc --delete                     remove them (rows + files on disk)
//   pnpm files:gc --delete --max-age-hours=72
//
// An attachment is "orphaned" when its id appears in no post content and no
// kas description. Only files older than --max-age-hours (default 24) count,
// so a draft that was just given a file is never swept.
async function main() {
  const args = process.argv.slice(2);
  const doDelete = args.includes("--delete");
  const maxAgeHours = Number(
    args.find((a) => a.startsWith("--max-age-hours="))?.split("=")[1] ?? "24",
  );
  if (!Number.isFinite(maxAgeHours) || maxAgeHours < 0) {
    console.error("--max-age-hours must be a non-negative number");
    process.exit(1);
  }

  const { inArray } = await import("drizzle-orm");
  const { unlink } = await import("node:fs/promises");
  const { db } = await import("./index");
  const schema = await import("./schema");
  const { resolveStoragePath } = await import("@/features/files/storage");

  const cutoff = new Date(Date.now() - maxAgeHours * 3_600_000);

  const [allAttachments, posts, kas] = await Promise.all([
    db.query.attachments.findMany(),
    db.query.posts.findMany({ columns: { content: true } }),
    db.query.kasTransactions.findMany({ columns: { description: true } }),
  ]);

  // Every place a /api/files/<id> reference can legitimately live today.
  const referenced = [
    ...posts.map((p) => p.content),
    ...kas.map((k) => k.description),
  ].join("\n");

  const orphans = allAttachments.filter(
    (a) => a.createdAt < cutoff && !referenced.includes(a.id),
  );

  if (orphans.length === 0) {
    console.log("No orphaned files.");
    process.exit(0);
  }

  const totalBytes = orphans.reduce((sum, a) => sum + a.size, 0);
  for (const a of orphans) {
    console.log(
      `${doDelete ? "delete" : "orphan"}  ${a.id}  ${a.filename}  ` +
        `${Math.round(a.size / 1024)} KB  ${a.createdAt.toISOString()}`,
    );
  }
  console.log(
    `\n${orphans.length} file(s), ${(totalBytes / 1024 / 1024).toFixed(1)} MB` +
      (doDelete ? " — deleting" : " — dry run, pass --delete to remove"),
  );
  if (!doDelete) process.exit(0);

  await db.delete(schema.attachments).where(
    inArray(
      schema.attachments.id,
      orphans.map((a) => a.id),
    ),
  );
  for (const a of orphans) {
    try {
      await unlink(resolveStoragePath(a.storageKey));
    } catch {
      // already gone on disk — the row is what mattered
    }
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("gc-files failed:", err);
  process.exit(1);
});
