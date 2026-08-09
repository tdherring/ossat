import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts", "src/simulator/**/*.ts"],
      exclude: ["src/lib/demoApolloLink.ts", "src/lib/demoData.ts", "**/*.test.ts"],
      thresholds: {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
  build: {
    outDir: "build",
  },
});
