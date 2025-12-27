import "server-only"

/**
 * Environment guardrails for optional database usage.
 *
 * ENABLE_DB
 * - Optional boolean flag ("true" to enable, anything else is treated as false)
 * - Defaults to false so the app can deploy without any database configuration.
 *
 * MONGODB_URI
 * - Optional MongoDB connection string used by Prisma when the database is enabled.
 * - When missing, Prisma is skipped and database features become no-ops.
 */
const rawEnableDb = process.env.ENABLE_DB

export const databaseEnv = {
  enableDb: rawEnableDb === "true",
  mongoDbUri: process.env.MONGODB_URI ?? "",
  get isDbConfigured() {
    return this.enableDb && Boolean(this.mongoDbUri)
  },
  get disabledReason() {
    if (!this.enableDb) {
      return "Database integration is disabled. Set ENABLE_DB=true and provide MONGODB_URI to opt in."
    }

    if (!this.mongoDbUri) {
      return "ENABLE_DB=true but MONGODB_URI is missing. Add a MongoDB connection string to enable Prisma."
    }

    return null
  },
}

// TODO: Wire a runtime health check endpoint when remote persistence is enabled.
