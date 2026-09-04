import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
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

export default async function RolesPage() {
  const session = await auth();
  if (!can(session, PERMISSIONS.ROLES_READ)) notFound();

  const roles = await listRoles();
  const canCreate = can(session, PERMISSIONS.ROLES_CREATE);
  const canUpdate = can(session, PERMISSIONS.ROLES_UPDATE);
  const canDelete = can(session, PERMISSIONS.ROLES_DELETE);
  const showActions = canUpdate || canDelete;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles</h1>
        {canCreate && (
          <RoleFormDialog mode="create" trigger={<Button>New role</Button>} />
        )}
      </div>

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Users</TableHead>
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
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
    </div>
  );
}
