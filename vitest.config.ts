import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

process.env.TZ = "America/Sao_Paulo";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
      restoreMocks: true,
      clearMocks: true,
      coverage: {
        provider: "v8",
        include: [
          "src/features/*/{domain,data}/**",
          "src/shared/lib/**",
          "src/shared/api/createCrudRepository.ts",
        ],
        exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts"],
        thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
        reporter: ["text", "html"],
      },
    },
  }),
);
