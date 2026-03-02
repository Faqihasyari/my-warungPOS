import  { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      storeId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    storeId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string
    storeId?: string | null
  }
}
