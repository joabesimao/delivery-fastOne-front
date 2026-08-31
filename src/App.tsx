import type { ReactNode } from "react";
import ThemeModeProvider from "./context/ThemeModeProvider";
import AppShell from "./components/layout/AppShell";

function AppLayout({ children }: { children?: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function App({ children }: { children?: ReactNode }) {
  return (
    <ThemeModeProvider>
      <AppLayout>{children}</AppLayout>
    </ThemeModeProvider>
  );
}

export default App;
