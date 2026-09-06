import { z } from "zod";

/**
 * Server-side environment schema.
 * Add new required vars here — the app fails fast at boot if they're missing,
 * instead of crashing later somewhere deep in a request handler.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Database
  DATABASE_URL: z.url({
    message: "DATABASE_URL must be a valid connection string",
  }),

  // Auth.js
  AUTH_SECRET: z
    .string()
    .min(
      32,
      "AUTH_SECRET must be at least 32 characters (openssl rand -base64 33)",
    ),
  AUTH_URL: z.url().optional(),

  // File uploads (see src/features/files/). UPLOAD_DIR holds the raw bytes;
  // it must be a persisted path in production (a mounted Docker volume — see
  // docker/docker-compose.yml), not a directory inside the image.
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(50),

  // Public (exposed to the browser — must be NEXT_PUBLIC_ prefixed)
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      z.flattenError(parsed.error).fieldErrors,
    );
    throw new Error(
      "Invalid environment variables — check .env against .env.example",
    );
  }

  return parsed.data;
}

export const env = loadEnv();
