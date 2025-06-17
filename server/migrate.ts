import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

export async function runMigrations() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    
    console.log("Starting migrations..."); 
    console.log("Migrations directory:", path.join(__dirname, "migrations"));
    
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "migrations")
    });
    
    console.log("Migrations applied successfully");
  } catch (err) {
    console.error("Migration failed:", err);
    throw err; // Важно пробросить ошибку дальше
  }
}