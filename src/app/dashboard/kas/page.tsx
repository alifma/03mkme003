import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { SiberSpinner } from "@/components/siber-spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/features/auth/config";
import { deleteKasTransactionAction } from "@/features/kas/actions";
import { TransactionFormDialog } from "@/features/kas/components/transaction-form-dialog";
import { getKasBalance, listKasTransactions } from "@/features/kas/queries";
import { can } from "@/features/rbac/can";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { listUsersForSelect } from "@/features/users/queries";
import { formatDate, formatRupiah } from "@/lib/format";
import type { Session } from "next-auth";

export default async function KasPage() {
  const rawSession = await auth();
  if (!can(rawSession, PERMISSIONS.KAS_READ)) notFound();
  // `can()` returning true guarantees a real session.
  const session = rawSession!;

  // Balance and the user list are small/fast lookups — fetched here (not
  // inside the Suspense boundary below) so the heading, saldo, and "New
  // transaction" button render immediately instead of waiting on the full
  // transactions list.
  const [balance, users] = await Promise.all([
    getKasBalance(),
    listUsersForSelect(),
  ]);
  const canCreate = can(session, PERMISSIONS.KAS_CREATE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Saldo saat ini:{" "}
            <span className="text-foreground font-semibold">
              {formatRupiah(balance)}
            </span>
          </p>
        </div>
        {canCreate && (
          <TransactionFormDialog
            mode="create"
            users={users}
            trigger={<Button>New transaction</Button>}
          />
        )}
      </div>

      <Suspense
        fallback={
          <SiberSpinner label="Loading transactions" minHeight="16rem" />
        }
      >
        <KasTable session={session} users={users} />
      </Suspense>
    </div>
  );
}

async function KasTable({
  session,
  users,
}: {
  session: Session;
  users: Awaited<ReturnType<typeof listUsersForSelect>>;
}) {
  const transactions = await listKasTransactions();
  const canUpdate = can(session, PERMISSIONS.KAS_UPDATE);
  const canDelete = can(session, PERMISSIONS.KAS_DELETE);
  const showActions = canUpdate || canDelete;

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Person</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="text-muted-foreground">
              {formatDate(t.date)}
            </TableCell>
            <TableCell>{t.user?.name ?? t.user?.username ?? "—"}</TableCell>
            <TableCell className="max-w-xs whitespace-pre-wrap">
              {t.description}
            </TableCell>
            <TableCell>
              <span
                className={
                  t.type === "in"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                }
              >
                {t.type === "in" ? "Pemasukan" : "Pengeluaran"}
              </span>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {t.type === "in" ? "+" : "-"}
              {formatRupiah(t.amount)}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex justify-end gap-1">
                  {canUpdate && (
                    <TransactionFormDialog
                      mode="edit"
                      users={users}
                      transaction={{
                        id: t.id,
                        date: t.date.toISOString().slice(0, 10),
                        description: t.description,
                        type: t.type,
                        amount: t.amount,
                        userId: t.user?.id ?? "",
                      }}
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      }
                    />
                  )}
                  {canDelete && (
                    <ConfirmDeleteButton
                      title="Delete this transaction?"
                      description="This can't be undone."
                      action={deleteKasTransactionAction.bind(null, t.id)}
                    />
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-muted-foreground text-center"
            >
              Belum ada transaksi.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
