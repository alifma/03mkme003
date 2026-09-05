import { z } from "zod";

export const kasTransactionSchema = z.object({
  date: z.string().min(1, "Date is required"), // yyyy-mm-dd from <input type="date">
  description: z.string().min(1, "Description is required").max(1000),
  type: z.enum(["in", "out"]),
  amount: z.coerce.number().int().positive("Amount must be greater than 0"),
  // Who the transaction is about (e.g. "iuran dari Budi") — empty string
  // means "no specific person" (general expense), not validated against
  // the users table here; the FK constraint handles that at write time.
  userId: z.string().optional(),
});

export type KasTransactionInput = z.infer<typeof kasTransactionSchema>;
