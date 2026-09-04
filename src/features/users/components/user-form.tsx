"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserFormValues {
  name?: string;
  username: string;
  email: string;
  // Always a string (never undefined) — empty in edit mode means "keep the
  // current password". Whether empty is *allowed* is a validation rule
  // (see formSchema's .refine below), not part of the type.
  password: string;
  roleIds: string[];
}

interface UserFormProps {
  mode: "create" | "edit";
  roles: { id: string; name: string }[];
  action: (input: UserFormValues) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<UserFormValues>;
}

export function UserForm({
  mode,
  roles,
  action,
  defaultValues,
}: UserFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Client-side UX validation only — the Server Action re-validates
  // authoritatively via createUserSchema/updateUserSchema (see ../schema.ts).
  // `password` stays a required `string` in the schema's shape (matching
  // UserFormValues) — the "required on create, optional-if-blank on edit"
  // rule lives in .refine() instead, so it doesn't affect the inferred type.
  const formSchema = z
    .object({
      name: z.string().max(200).optional(),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50)
        .regex(
          /^[a-z0-9_.-]+$/i,
          "Only letters, numbers, and _ . - are allowed",
        ),
      email: z.email(),
      password: z.string(),
      roleIds: z.array(z.string()),
    })
    .refine(
      (data) =>
        mode === "create"
          ? data.password.length >= 8
          : data.password.length === 0 || data.password.length >= 8,
      { message: "Password must be at least 8 characters", path: ["password"] },
    );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      roleIds: [],
      ...defaultValues,
    },
  });

  function onSubmit(values: UserFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) setServerError(result.error);
    });
  }

  const roleIds = useWatch({ control: form.control, name: "roleIds" });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-md space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          {...form.register("username")}
        />
        {form.formState.errors.username && (
          <p className="text-destructive text-sm">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-destructive text-sm">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password{mode === "edit" ? " (leave blank to keep current)" : ""}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-destructive text-sm">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Roles</Label>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <Checkbox
                id={`role-${role.id}`}
                checked={roleIds?.includes(role.id) ?? false}
                onCheckedChange={(checked) => {
                  const current = form.getValues("roleIds") ?? [];
                  form.setValue(
                    "roleIds",
                    checked
                      ? [...current, role.id]
                      : current.filter((rid) => rid !== role.id),
                  );
                }}
              />
              <Label htmlFor={`role-${role.id}`} className="font-normal">
                {role.name}
              </Label>
            </div>
          ))}
          {roles.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No roles yet — create one first.
            </p>
          )}
        </div>
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving…"
          : mode === "create"
            ? "Create user"
            : "Save changes"}
      </Button>
    </form>
  );
}
