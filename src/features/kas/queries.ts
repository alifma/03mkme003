import { db } from "@/db";

export async function listKasTransactions() {
  return db.query.kasTransactions.findMany({
    with: { createdByUser: { columns: { name: true, email: true } } },
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
