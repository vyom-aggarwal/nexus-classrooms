import type { Role } from "@/generated/prisma/enums";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// next-auth's own callback types resolve JWT from @auth/core/jwt directly
// (next-auth/jwt only re-exports it), so the augmentation has to land here too.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
