import { Pool } from "pg"; // ⚠️ Используем pg вместо @neondatabase/serverless
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Нужно для Render.com
  connectionTimeoutMillis: 5000, // Таймаут 5 секунд
});

export const db = drizzle(pool, { schema });