import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
});

export type PostInput = z.infer<typeof postSchema>;
