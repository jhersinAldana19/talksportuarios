import type { NextAuthConfig } from "next-auth";

// Config que puede correr en el proxy: sin Prisma ni bcrypt.
// La sesión es un JWT de 12 horas. El proveedor Credentials vive en auth.ts.
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname === "/admin/login") return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
