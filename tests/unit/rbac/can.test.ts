import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { can, canAll, canAny } from "@/features/rbac/can";

function sessionWith(permissions: string[]): Session {
  return {
    user: { id: "u1", email: "a@b.com", roles: [], permissions },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as Session;
}

describe("can", () => {
  it("returns true when the session has the permission", () => {
    expect(can(sessionWith(["users:read"]), "users:read")).toBe(true);
  });

  it("returns false when the session lacks the permission", () => {
    expect(can(sessionWith(["users:read"]), "users:update")).toBe(false);
  });

  it("returns false for a null session", () => {
    expect(can(null, "users:read")).toBe(false);
  });

  it("returns false for an undefined session", () => {
    expect(can(undefined, "users:read")).toBe(false);
  });
});

describe("canAny", () => {
  it("returns true if at least one permission matches", () => {
    expect(
      canAny(sessionWith(["users:read"]), ["users:update", "users:read"]),
    ).toBe(true);
  });

  it("returns false if none match", () => {
    expect(
      canAny(sessionWith(["users:read"]), ["users:update", "users:delete"]),
    ).toBe(false);
  });
});

describe("canAll", () => {
  it("returns true only if every permission matches", () => {
    expect(
      canAll(sessionWith(["users:read", "dashboard:view"]), [
        "users:read",
        "dashboard:view",
      ]),
    ).toBe(true);
  });

  it("returns false if any permission is missing", () => {
    expect(
      canAll(sessionWith(["users:read"]), ["users:read", "users:update"]),
    ).toBe(false);
  });
});
