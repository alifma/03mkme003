"use client";

import { useState, type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createKasTransactionAction,
  updateKasTransactionAction,
} from "../actions";
import { TransactionForm } from "./transaction-form";
import type { KasTransactionInput } from "../schema";

interface TransactionFormDialogProps {
  trigger: ReactElement;
  mode: "create" | "edit";
  transaction?: { id: string } & KasTransactionInput;
}

export function TransactionFormDialog({
  trigger,
  mode,
  transaction,
}: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleAction(values: KasTransactionInput) {
    const result =
      mode === "create"
        ? await createKasTransactionAction(values)
        : await updateKasTransactionAction(transaction!.id, values);
    if (!result?.error) setOpen(false);
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New transaction" : "Edit transaction"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Record a kas transaction."
              : "Update this transaction's details."}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          key={open ? (transaction?.id ?? "new") : "closed"}
          action={handleAction}
          defaultValues={transaction}
          submitLabel={
            mode === "create" ? "Create transaction" : "Save changes"
          }
        />
      </DialogContent>
    </Dialog>
  );
}
