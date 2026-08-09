import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = ["/home", "/classes", "/calendar", "/grades", "/meet"];

// Split out from auth.ts so the Edge middleware bundle never pulls in the
// Prisma/pg driver (Node-only) — only the route/session logic runs there.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
      const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/home", request.nextUrl));
        return true;
      }
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
