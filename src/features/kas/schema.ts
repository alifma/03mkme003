import { z } from "zod";

export const kasTransactionSchema = z.object({
  date: z.string().min(1, "Date is required"), // yyyy-mm-dd from <input type="date">
  description: z.string().min(1, "Description is required").max(300),
  type: z.enum(["in", "out"]),
  amount: z.coerce.number().int().positive("Amount must be greater than 0"),
});

export type KasTransactionInput = z.infer<typeof kasTransactionSchema>;
