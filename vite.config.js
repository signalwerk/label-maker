import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "mini-pdf": fileURLToPath(
        new URL("./mini-pdf/src/index.ts", import.meta.url)
      ),
      "mini-svg": fileURLToPath(
        new URL("./mini-svg/src/index.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    setupFiles: "./src/setupTests.js",
  },
});
