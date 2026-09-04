"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KasTransactionInput } from "../schema";

// A plain z.number() here (not the server schema's z.coerce.number()) keeps
// the form's field type as `number`, matching KasTransactionInput exactly —
// z.coerce's input type is `unknown`, which react-hook-form's Resolver
// generic can't reconcile with useForm<KasTransactionInput>(). The native
// number input still hands RHF a number thanks to `valueAsNumber: true`
// on register() below; the server action re-validates authoritatively via
// the real (coercing) kasTransactionSchema in ../schema.ts regardless.
const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required").max(300),
  type: z.enum(["in", "out"]),
  amount: z.number().int().positive("Amount must be greater than 0"),
});

interface TransactionFormProps {
  action: (input: KasTransactionInput) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<KasTransactionInput>;
  submitLabel?: string;
}

export function TransactionForm({
  action,
  defaultValues,
  submitLabel = "Save",
}: TransactionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<KasTransactionInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: today,
      description: "",
      type: "in",
      amount: 0,
      ...defaultValues,
    },
  });

  function onSubmit(values: KasTransactionInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-md space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...form.register("date")} />
        {form.formState.errors.date && (
          <p className="text-destructive text-sm">
            {form.formState.errors.date.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-destructive text-sm">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        {/* Plain native <select> — Base UI's Select needs a Controller-style
            wiring with react-hook-form; not worth the extra complexity for a
            two-option field. Still gets our input focus/border styling. */}
        <select
          id="type"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-3"
          {...form.register("type")}
        >
          <option value="in">Pemasukan</option>
          <option value="out">Pengeluaran</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (Rp)</Label>
        <Input
          id="amount"
          type="number"
          min={1}
          step={1}
          {...form.register("amount", { valueAsNumber: true })}
        />
        {form.formState.errors.amount && (
          <p className="text-destructive text-sm">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
