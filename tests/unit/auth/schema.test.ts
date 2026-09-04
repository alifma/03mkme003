import { describe, expect, it } from "vitest";
import { credentialsSchema, loginSchema } from "@/features/auth/schema";

describe("credentialsSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    expect(
      credentialsSchema.safeParse({ email: "a@b.com", password: "secret" })
        .success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      credentialsSchema.safeParse({ email: "not-an-email", password: "secret" })
        .success,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(
      credentialsSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts an optional callbackUrl", () => {
    expect(
      loginSchema.safeParse({
        email: "a@b.com",
        password: "secret",
        callbackUrl: "/dashboard",
      }).success,
    ).toBe(true);
  });

  it("works without a callbackUrl", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "secret" }).success,
    ).toBe(true);
  });
});
