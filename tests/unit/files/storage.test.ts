import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// storage.ts reads env at import time, so stub before importing and reset
// the module registry between cases.
beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");
  vi.stubEnv("AUTH_SECRET", "a".repeat(32));
  vi.stubEnv("UPLOAD_DIR", "./uploads-test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("resolveStoragePath", () => {
  it("resolves a normal key under the upload root", async () => {
    const { resolveStoragePath } = await import("@/features/files/storage");
    const root = path.resolve("./uploads-test");
    expect(resolveStoragePath("ab/cd/file.pptx")).toBe(
      path.join(root, "ab", "cd", "file.pptx"),
    );
  });

  it("rejects keys that escape the upload root", async () => {
    const { resolveStoragePath } = await import("@/features/files/storage");
    expect(() => resolveStoragePath("../secret")).toThrow();
    expect(() => resolveStoragePath("ab/../../../etc/passwd")).toThrow();
    expect(() => resolveStoragePath(path.resolve("/etc/passwd"))).toThrow();
  });
});
