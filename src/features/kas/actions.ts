"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { kasTransactions } from "@/db/schema";
import { requirePermission } from "@/features/rbac/guard";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { kasTransactionSchema, type KasTransactionInput } from "./schema";

export interface KasActionState {
  error?: string;
}

export async function createKasTransactionAction(
  input: KasTransactionInput,
): Promise<KasActionState | void> {
  const session = await requirePermission(PERMISSIONS.KAS_CREATE);

  const parsed = kasTransactionSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data" };

  await db.insert(kasTransactions).values({
    date: new Date(parsed.data.date),
    description: parsed.data.description,
    type: parsed.data.type,
    amount: parsed.data.amount,
    userId: parsed.data.userId || null,
    createdBy: session.user.id,
  });

  revalidatePath("/dashboard/kas");
  revalidatePath("/dashboard/profile");
}

export async function updateKasTransactionAction(
  id: string,
  input: KasTransactionInput,
): Promise<KasActionState | void> {
  await requirePermission(PERMISSIONS.KAS_UPDATE);

  const parsed = kasTransactionSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data" };

  await db
    .update(kasTransactions)
    .set({
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      type: parsed.data.type,
      amount: parsed.data.amount,
      userId: parsed.data.userId || null,
    })
    .where(eq(kasTransactions.id, id));

  revalidatePath("/dashboard/kas");
  revalidatePath("/dashboard/profile");
}

export async function deleteKasTransactionAction(
  id: string,
): Promise<KasActionState | void> {
  await requirePermission(PERMISSIONS.KAS_DELETE);
  await db.delete(kasTransactions).where(eq(kasTransactions.id, id));
  revalidatePath("/dashboard/kas");
  revalidatePath("/dashboard/profile");
}
