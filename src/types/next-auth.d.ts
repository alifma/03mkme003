import type { DefaultSession } from "next-auth";
import type { Permission } from "@/features/rbac/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: Permission[];
    } & DefaultSession["user"];
  }
}

// Augmenting via "next-auth/jwt" doesn't merge — that module re-exports JWT
// with `export *`, which TS declaration merging can't attach to. The
// interface actually lives in "@auth/core/jwt".
declare module "@auth/core/jwt" {
  interface JWT {
    roles?: string[];
    permissions?: Permission[];
  }
}
