import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string
      name?: string
      image?: string
      role?: string
      playerId?: string
      player?: {
        id: string
        name: string
        nickname?: string
        role: string
        team: {
          id: string
          name: string
          shortName: string
        }
      }
    }
  }

  interface User {
    role?: string
    playerId?: string
    player?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    playerId?: string
    player?: any
  }
}