import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient | null = null

if (process.env.ENABLE_DB === "true") {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
    })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
  }
}

export { prisma }