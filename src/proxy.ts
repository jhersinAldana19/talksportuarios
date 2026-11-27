import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// En Next 16 el antiguo middleware.ts se llama proxy.ts.
// Solo mira la cookie JWT: no toca la base. El matcher deja fuera el sitio público y /api/auth.
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
