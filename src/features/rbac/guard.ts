import type { Session } from "next-auth";
import { auth } from "@/features/auth/config";
import { can } from "./can";
import type { Permission } from "./permissions";

export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "UnauthenticatedError";
  }
}

/**
 * Throws if the session doesn't have `permission`. Narrows `session` to
 * non-null on success, so callers get a typed session back for free.
 *
 * Call this at the START of every Server Action / route handler that
 * touches protected data — never rely on the UI hiding a button as the only
 * gate (see can.ts docstring / RBAC section in plan.md).
 */
export function assertPermission(
  session: Session | null | undefined,
  permission: Permission,
): asserts session is Session {
  if (!session) throw new UnauthenticatedError();
  if (!can(session, permission)) throw new ForbiddenError(permission);
}

/**
 * Convenience wrapper for Server Actions / route handlers: fetches the
 * current session and asserts the permission in one call.
 *
 * @example
 * async function deleteUser(id: string) {
 *   "use server";
 *   await requirePermission(PERMISSIONS.USERS_DELETE);
 *   // ...
 * }
 */
export async function requirePermission(
  permission: Permission,
): Promise<Session> {
  const session = await auth();
  assertPermission(session, permission);
  return session;
}

/**
 * Route Handler helper: turns a thrown `UnauthenticatedError` / `ForbiddenError`
 * into a 401 / 403 JSON response. Returns `null` for anything else so the
 * caller can rethrow (Server Actions don't need this — they just throw).
 *
 * @example
 * try {
 *   await requirePermission(PERMISSIONS.FILES_UPLOAD);
 * } catch (error) {
 *   const res = guardErrorResponse(error);
 *   if (res) return res;
 *   throw error;
 * }
 */
export function guardErrorResponse(error: unknown): Response | null {
  if (error instanceof UnauthenticatedError) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 });
  }
  return null;
}
