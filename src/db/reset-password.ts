import { loadEnvConfig } from "@next/env";

// Standalone script — mirrors seed.ts: load .env* the way Next.js does
// before importing anything that reads process.env (db client, env module).
loadEnvConfig(process.cwd());

// Usage:
//   pnpm db:reset-password <username-or-email> <new-password>
//
// Resolves the target database from DATABASE_URL, so point that at the
// instance you mean:
//   DATABASE_URL=postgresql://user:pass@host:5433/siber pnpm db:reset-password admin 'NewPass123!'
async function main() {
  const [identifier, newPassword] = process.argv.slice(2);
  if (!identifier || !newPassword) {
    console.error(
      "Usage: pnpm db:reset-password <username-or-email> <new-password>",
    );
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error("Refusing: password must be at least 8 characters.");
    process.exit(1);
  }

  const { eq } = await import("drizzle-orm");
  const { db } = await import("./index");
  const schema = await import("./schema");
  const { hashPassword } = await import("@/features/auth/password");

  const user = await db.query.users.findFirst({
    where: (u, { eq: eqOp, or }) =>
      or(eqOp(u.username, identifier), eqOp(u.email, identifier)),
  });
  if (!user) {
    console.error(`No user matching "${identifier}".`);
    process.exit(1);
  }

  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(newPassword) })
    .where(eq(schema.users.id, user.id));

  console.log(
    `Password updated for ${user.username} <${user.email}>. Sign in with the new password.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
