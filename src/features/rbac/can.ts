import type { Session } from "next-auth";
import type { Permission } from "./permissions";

type MaybeSession = Session | null | undefined;

/** Core check — application code should call this instead of comparing roles directly. */
export function can(session: MaybeSession, permission: Permission): boolean {
  return session?.user?.permissions?.includes(permission) ?? false;
}

export function canAny(
  session: MaybeSession,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => can(session, permission));
}

export function canAll(
  session: MaybeSession,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => can(session, permission));
}
