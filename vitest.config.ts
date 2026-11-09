import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

process.env.TZ = "America/Sao_Paulo";

const domTests = [
  "src/features/*/application/**/*.test.{ts,tsx}",
  "src/features/*/ui/**/*.test.{ts,tsx}",
  "src/shared/lib/hooks/**/*.test.{ts,tsx}",
  "src/shared/lib/query/**/*.test.{ts,tsx}",
];

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      restoreMocks: true,
      clearMocks: true,
      projects: [
        {
          extends: true,
          test: {
            name: "node",
            environment: "node",
            include: ["src/**/*.test.{ts,tsx}"],
            exclude: domTests,
          },
        },
        {
          extends: true,
          test: {
            name: "jsdom",
            setupFiles: ["src/test/setup.ts"],
            environment: "jsdom",
            include: domTests,
          },
        },
      ],
      coverage: {
        provider: "v8",
        include: [
          "src/features/*/{domain,data}/**",
          "src/shared/lib/**",
          "src/features/*/application/{dashboardQueries,deliveryQueries,useDeliveryRealtimeSync,clientQueries,productQueries,userQueries,useFleetFilters,useFleetOptions,useGlobalSearch,useLogin,useLogout}.ts",
          "src/features/chat/application/{useChatChannel,useChatComposer,useChatSearch,useChatTyping,useChatWidget,useDraggableWidget}.ts",
          "src/features/notifications/application/{NotificationsContext,useNotifications,useBroadcastNotice}.ts",
          "src/features/notifications/application/NotificationsProvider.tsx",
          "src/shared/api/createCrudRepository.ts",
        ],
        exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts"],
        thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
        reporter: ["text", "html"],
      },
    },
  }),
);
