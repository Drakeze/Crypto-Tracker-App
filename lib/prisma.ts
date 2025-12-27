import { PrismaClient } from "@prisma/client"

import { databaseEnv } from "./env"

// Prevent creating multiple PrismaClient instances in development while keeping the client optional.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null }

// Prisma is opt-in: only instantiate the client when explicitly enabled and properly configured.
export const prisma: PrismaClient | null = (() => {
  if (!databaseEnv.isDbConfigured) {
    return null
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["warn", "error"],
    })
  }

  return globalForPrisma.prisma
})()

export const isDatabaseEnabled = databaseEnv.enableDb
export const databaseDisabledReason = databaseEnv.disabledReason

// TODO: Extend with telemetry and connection health checks when we add auth/user flows or remote favorite sync.
