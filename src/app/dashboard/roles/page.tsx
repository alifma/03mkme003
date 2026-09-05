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
import { deleteRoleAction } from "@/features/roles/actions";
import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { listRoles } from "@/features/roles/queries";
import type { Session } from "next-auth";

export default async function RolesPage() {
  const rawSession = await auth();
  if (!can(rawSession, PERMISSIONS.ROLES_READ)) notFound();
  // `can()` returning true guarantees a real session.
  const session = rawSession!;

  const canCreate = can(session, PERMISSIONS.ROLES_CREATE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles</h1>
        {canCreate && (
          <RoleFormDialog mode="create" trigger={<Button>New role</Button>} />
        )}
      </div>

      <Suspense
        fallback={<SiberSpinner label="Loading roles" minHeight="16rem" />}
      >
        <RolesTable session={session} />
      </Suspense>
    </div>
  );
}

async function RolesTable({ session }: { session: Session }) {
  const roles = await listRoles();
  const canUpdate = can(session, PERMISSIONS.ROLES_UPDATE);
  const canDelete = can(session, PERMISSIONS.ROLES_DELETE);
  const showActions = canUpdate || canDelete;

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Users</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {role.description ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {role.permissions.length}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {role.userCount}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex justify-end gap-1">
                  {canUpdate && (
                    <RoleFormDialog
                      mode="edit"
                      role={role}
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
                      title="Delete this role?"
                      description={
                        role.userCount > 0
                          ? `${role.userCount} user(s) currently have this role — reassign them first.`
                          : "This can't be undone."
                      }
                      action={deleteRoleAction.bind(null, role.id)}
                    />
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {roles.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground text-center"
            >
              No roles yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
