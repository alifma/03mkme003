import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/config/env";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { getUserRolesAndPermissions } from "@/features/rbac/queries";
import { verifyPassword } from "./password";
import { credentialsSchema } from "./schema";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials provider requires JWT sessions — the adapter is still used
  // for user/account persistence (and is ready for OAuth providers later).
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.query.users.findFirst({
          where: (u, { eq, or }) =>
            or(
              eq(u.username, parsed.data.identifier),
              eq(u.email, parsed.data.identifier),
            ),
        });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on sign-in — roles/permissions get baked into
      // the token here rather than re-queried on every request. If a role's
      // permissions change, the affected users see it after their next
      // sign-in (or wire up `unstable_update` from a server action to force
      // a refresh sooner).
      if (user?.id) {
        const { roles, permissions } = await getUserRolesAndPermissions(
          user.id,
        );
        token.roles = roles;
        token.permissions = permissions;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.sub ?? "";
      session.user.roles = token.roles ?? [];
      session.user.permissions = token.permissions ?? [];
      return session;
    },
  },
});
