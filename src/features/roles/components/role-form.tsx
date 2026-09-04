"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERMISSION_GROUPS } from "@/features/rbac/permissions";

export interface RoleFormValues {
  name: string;
  description?: string;
  permissions: string[];
}

interface RoleFormProps {
  mode: "create" | "edit";
  action: (input: RoleFormValues) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<RoleFormValues>;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()),
});

export function RoleForm({ mode, action, defaultValues }: RoleFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      ...defaultValues,
    },
  });

  function onSubmit(values: RoleFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) setServerError(result.error);
    });
  }

  const selected = useWatch({ control: form.control, name: "permissions" });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-lg space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...form.register("description")} />
      </div>

      <div className="space-y-3">
        <Label>Permissions</Label>
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.resource} className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">{group.resource}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {group.permissions.map((permission) => {
                const actionName = permission.split(":")[1];
                return (
                  <div key={permission} className="flex items-center gap-2">
                    <Checkbox
                      id={`perm-${permission}`}
                      checked={selected?.includes(permission) ?? false}
                      onCheckedChange={(checked) => {
                        const current = form.getValues("permissions") ?? [];
                        form.setValue(
                          "permissions",
                          checked
                            ? [...current, permission]
                            : current.filter((p) => p !== permission),
                        );
                      }}
                    />
                    {/* Visible text matches the accessible name (WCAG "Label in
                        Name") — includes the resource so it's unambiguous even
                        outside the group's visual context (screen readers,
                        browser find, tests). */}
                    <Label
                      htmlFor={`perm-${permission}`}
                      className="text-sm font-normal capitalize"
                    >
                      {group.resource} {actionName}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving…"
          : mode === "create"
            ? "Create role"
            : "Save changes"}
      </Button>
    </form>
  );
}
