import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
    server: {
      deps: {
        inline: ["next-auth", "next"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next/server": path.resolve(__dirname, "node_modules/next/server.js"),
    },
  },
});
