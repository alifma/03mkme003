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
import { createUserAction, updateUserAction } from "../actions";
import { UserForm, type UserFormValues } from "./user-form";

interface UserFormDialogProps {
  trigger: ReactElement;
  roles: { id: string; name: string }[];
  mode: "create" | "edit";
  user?: {
    id: string;
    name: string | null;
    username: string;
    email: string;
    roleIds: string[];
  };
}

export function UserFormDialog({
  trigger,
  roles,
  mode,
  user,
}: UserFormDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleAction(values: UserFormValues) {
    const result =
      mode === "create"
        ? await createUserAction(values)
        : await updateUserAction(user!.id, values);
    if (!result?.error) setOpen(false);
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New user" : "Edit user"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a login for a classmate."
              : "Update this user's details, password, or roles."}
          </DialogDescription>
        </DialogHeader>
        {/* key resets the form's internal state each time a different row's
            dialog opens, or after a create dialog is closed and reopened. */}
        <UserForm
          key={open ? (user?.id ?? "new") : "closed"}
          mode={mode}
          roles={roles}
          action={handleAction}
          defaultValues={
            user
              ? {
                  name: user.name ?? "",
                  username: user.username,
                  email: user.email,
                  roleIds: user.roleIds,
                }
              : undefined
          }
        />
      </DialogContent>
    </Dialog>
  );
}
