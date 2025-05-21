import type { Config } from "drizzle-kit";

export default {
  schema: "./schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
} satisfies Config;