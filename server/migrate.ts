import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";
import path from "path";
import { fileURLToPath } from "url";

// Добавьте эту функцию перед запуском сервера
export async function runMigrations() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "migrations")
    });
    
    console.log("Migrations applied successfully");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1); // Завершаем процесс при ошибке миграции
  }
}