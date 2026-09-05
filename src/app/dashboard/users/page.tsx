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
import { can } from "@/features/rbac/can";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { listRolesForSelect } from "@/features/roles/queries";
import { deleteUserAction } from "@/features/users/actions";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { listUsers } from "@/features/users/queries";
import type { Session } from "next-auth";

// Sidebar already hides this link without users:read (see nav-items.ts), but
// that's UX only — direct navigation to /dashboard/users must still be
// blocked here.
export default async function UsersPage() {
  const rawSession = await auth();
  if (!can(rawSession, PERMISSIONS.USERS_READ)) notFound();
  // `can()` returning true guarantees a real session.
  const session = rawSession!;

  // Roles is a small, fast lookup table — fetched here (not inside the
  // Suspense boundary below) so the heading and "New user" button render
  // immediately instead of waiting on the users list.
  const roles = await listRolesForSelect();
  const canCreate = can(session, PERMISSIONS.USERS_CREATE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        {canCreate && (
          <UserFormDialog
            mode="create"
            roles={roles}
            trigger={<Button>New user</Button>}
          />
        )}
      </div>

      <Suspense
        fallback={<SiberSpinner label="Loading users" minHeight="16rem" />}
      >
        <UsersTable session={session} roles={roles} />
      </Suspense>
    </div>
  );
}

async function UsersTable({
  session,
  roles,
}: {
  session: Session;
  roles: Awaited<ReturnType<typeof listRolesForSelect>>;
}) {
  const users = await listUsers();
  const canUpdate = can(session, PERMISSIONS.USERS_UPDATE);
  const canDelete = can(session, PERMISSIONS.USERS_DELETE);
  const showActions = canUpdate || canDelete;

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name ?? "—"}</TableCell>
            <TableCell className="font-mono text-sm">{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.roles.join(", ") || "—"}</TableCell>
            {showActions && (
              <TableCell>
                <div className="flex justify-end gap-1">
                  {canUpdate && (
                    <UserFormDialog
                      mode="edit"
                      roles={roles}
                      user={user}
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
                      title="Delete this user?"
                      description={`${user.email} will lose access immediately. This can't be undone.`}
                      action={deleteUserAction.bind(null, user.id)}
                    />
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground text-center"
            >
              No users yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
