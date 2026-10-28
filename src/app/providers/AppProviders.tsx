import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import ThemeModeProvider from "@/shared/theme/ThemeModeProvider";
import ToastProvider from "@/shared/ui/feedback/ToastProvider";
import { queryClient } from "./queryClient";

const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeModeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeModeProvider>
  </QueryClientProvider>
);

export default AppProviders;
