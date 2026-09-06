"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/features/files/components/markdown-editor";
import { postSchema, type PostInput } from "../schema";

interface PostFormProps {
  action: (input: PostInput) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<PostInput>;
  submitLabel?: string;
  maxUploadMb: number;
}

export function PostForm({
  action,
  defaultValues,
  submitLabel = "Save",
  maxUploadMb,
}: PostFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", excerpt: "", content: "", ...defaultValues },
  });

  function onSubmit(values: PostInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-destructive text-sm">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Excerpt (shown publicly, before login)</Label>
        <Input id="excerpt" {...form.register("excerpt")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <MarkdownEditor
              id="content"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxUploadMb={maxUploadMb}
            />
          )}
        />
        {form.formState.errors.content && (
          <p className="text-destructive text-sm">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
