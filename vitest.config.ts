import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    // jest-dom matchers only needed in jsdom tests — avoid loading dom-related
    // packages in node-environment tests (avoids incomplete package errors).
    environmentMatchGlobs: [["**/*.browser.test.ts", "jsdom"]],
    setupFiles: [],
    // Per-environment setup: only apply jest-dom in jsdom environment
    env: {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
