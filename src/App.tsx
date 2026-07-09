import ThemeModeProvider from "./context/ThemeModeProvider";
import AppShell from "./components/layout/AppShell";

function AppLayout() {
  return (
    <AppShell />
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <AppLayout />
    </ThemeModeProvider>
  );
}

export default App;
