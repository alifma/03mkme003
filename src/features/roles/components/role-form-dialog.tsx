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
import { createRoleAction, updateRoleAction } from "../actions";
import { RoleForm, type RoleFormValues } from "./role-form";

interface RoleFormDialogProps {
  trigger: ReactElement;
  mode: "create" | "edit";
  role?: {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
  };
}

export function RoleFormDialog({ trigger, mode, role }: RoleFormDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleAction(values: RoleFormValues) {
    const result =
      mode === "create"
        ? await createRoleAction(values)
        : await updateRoleAction(role!.id, values);
    if (!result?.error) setOpen(false);
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New role" : "Edit role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Name it and pick what it can do."
              : "Update the name, description, or permissions."}
          </DialogDescription>
        </DialogHeader>
        <RoleForm
          key={open ? (role?.id ?? "new") : "closed"}
          mode={mode}
          action={handleAction}
          defaultValues={
            role
              ? {
                  name: role.name,
                  description: role.description ?? "",
                  permissions: role.permissions,
                }
              : undefined
          }
        />
      </DialogContent>
    </Dialog>
  );
}
