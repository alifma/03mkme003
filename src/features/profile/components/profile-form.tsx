"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Client-side UX validation only — the Server Action re-validates
// authoritatively via updateProfileSchema (see ../schema.ts).
const formSchema = z
  .object({
    name: z.string().max(200).optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Enter your current password to set a new one",
    path: ["currentPassword"],
  });

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  action: (input: ProfileFormValues) => Promise<{ error?: string } | void>;
  defaultName: string;
}

export function ProfileForm({ action, defaultName }: ProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: defaultName, currentPassword: "", newPassword: "" },
  });

  function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSaved(true);
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
      </div>

      <div className="border-border space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Change password</p>
        <p className="text-muted-foreground text-xs">
          Leave blank to keep your current password.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...form.register("currentPassword")}
          />
          {form.formState.errors.currentPassword && (
            <p className="text-destructive text-sm">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...form.register("newPassword")}
          />
          {form.formState.errors.newPassword && (
            <p className="text-destructive text-sm">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}
      {saved && !serverError && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
