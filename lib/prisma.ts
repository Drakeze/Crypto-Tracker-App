import { PrismaClient } from "@prisma/client"

// Prevent creating multiple PrismaClient instances in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// TODO: Extend with telemetry and connection health checks when we add auth/user flows.
