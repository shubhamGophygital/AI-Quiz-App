// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}
