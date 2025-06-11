import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // Указываем корень для сервера (не клиента!)
  root: path.resolve(import.meta.dirname, "server"),

  // Настройки сборки сервера
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/server"),
    emptyOutDir: true,
    // Целевой формат (CommonJS для Node.js)
    target: "node16",
    // Отключаем разбиение на чанки (серверу это не нужно)
    rollupOptions: {
      output: {
        format: "cjs",
        inlineDynamicImports: true,
      },
    },
  },

});