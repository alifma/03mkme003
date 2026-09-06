import { describe, expect, it } from "vitest";
import { credentialsSchema, loginSchema } from "@/features/auth/schema";

describe("credentialsSchema", () => {
  it("accepts a non-empty identifier and password", () => {
    expect(
      credentialsSchema.safeParse({ identifier: "alice", password: "secret" })
        .success,
    ).toBe(true);
  });

  it("accepts an email as the identifier", () => {
    expect(
      credentialsSchema.safeParse({
        identifier: "a@b.com",
        password: "secret",
      }).success,
    ).toBe(true);
  });

  it("rejects an empty identifier", () => {
    expect(
      credentialsSchema.safeParse({ identifier: "", password: "secret" })
        .success,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(
      credentialsSchema.safeParse({ identifier: "alice", password: "" })
        .success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts an optional callbackUrl", () => {
    expect(
      loginSchema.safeParse({
        identifier: "alice",
        password: "secret",
        callbackUrl: "/dashboard",
      }).success,
    ).toBe(true);
  });

  it("works without a callbackUrl", () => {
    expect(
      loginSchema.safeParse({ identifier: "alice", password: "secret" })
        .success,
    ).toBe(true);
  });
});
