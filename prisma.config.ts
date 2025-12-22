import { config as loadEnv } from "dotenv"

// Load environment variables for Prisma CLI usage without pulling in Next.js config.
loadEnv()

export default {
  schema: "./prisma/schema.prisma",
  // TODO: Add additional generators or split schemas when auth/multi-tenant support arrives.
}
