"use server";

import { AuthError } from "next-auth";
import { signIn } from "./config";
import { loginSchema, type LoginInput } from "./schema";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  input: LoginInput,
): Promise<LoginActionState | void> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid username or password" };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: parsed.data.callbackUrl || "/dashboard",
    });
  } catch (error) {
    // signIn() throws a redirect internally on success — only AuthError
    // (invalid credentials, etc.) should be turned into a form error.
    // Anything else (including the redirect) must be rethrown.
    if (error instanceof AuthError) {
      return { error: "Invalid username or password" };
    }
    throw error;
  }
}
