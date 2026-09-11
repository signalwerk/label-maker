/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(root, "src/index.ts"),
      name: "MiniSvg",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["mini-pdf"],
      output: { exports: "named" },
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
});
