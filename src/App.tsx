import type { ReactNode } from "react";
import ThemeModeProvider from "./context/ThemeModeProvider";
import AppShell from "./components/layout/AppShell";
import NotificationsProvider from "./context/NotificationsProvider";

function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <NotificationsProvider>
      <AppShell>{children}</AppShell>
    </NotificationsProvider>
  );
}

function App({ children }: { children?: ReactNode }) {
  return (
    <ThemeModeProvider>
      <AppLayout>{children}</AppLayout>
    </ThemeModeProvider>
  );
}

export default App;
