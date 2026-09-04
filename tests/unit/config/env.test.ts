import { afterEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("parses valid environment variables", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));

    const { env } = await import("@/config/env");
    expect(env.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/db");
    expect(env.NODE_ENV).toBe("test");
  });

  it("throws when required variables are missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", "");

    await expect(import("@/config/env")).rejects.toThrow();
  });

  it("throws when AUTH_SECRET is too short", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");
    vi.stubEnv("AUTH_SECRET", "too-short");

    await expect(import("@/config/env")).rejects.toThrow();
  });
});
