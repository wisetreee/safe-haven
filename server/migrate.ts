import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db.js"; 
import path from "path";

export async function runMigrations() {
  try {
    const migrationsPath = path.join(process.cwd(), "./migrations");
    
    console.log("Applying migrations from:", migrationsPath);
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("Migrations applied.");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  }
}