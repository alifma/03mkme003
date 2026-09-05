import { db } from "@/db";

export async function listKasTransactions() {
  return db.query.kasTransactions.findMany({
    with: {
      user: { columns: { id: true, name: true, username: true } },
      createdByUser: { columns: { name: true, email: true } },
    },
    orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
  });
}

export async function getKasBalance() {
  const rows = await db.query.kasTransactions.findMany({
    columns: { type: true, amount: true },
  });
  return rows.reduce(
    (sum, t) => sum + (t.type === "in" ? t.amount : -t.amount),
    0,
  );
}

/** Total "in" (iuran/dues) recorded against a specific person — shown on
 * their profile page. Doesn't count "out" transactions against them since
 * there's no such use case yet (expenses aren't attributed to a person). */
export async function getUserKasContribution(userId: string) {
  const rows = await db.query.kasTransactions.findMany({
    columns: { amount: true, type: true },
    where: (t, { eq }) => eq(t.userId, userId),
  });
  return rows.reduce((sum, t) => sum + (t.type === "in" ? t.amount : 0), 0);
}
