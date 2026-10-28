import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ThemeModeContext } from "./ThemeModeContext";
import type { ThemeMode } from "./ThemeModeContext";

import createAppTheme from "./appTheme";
import { storage } from "../lib/storage";

const THEME_MODE_KEY = "themeMode";

const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() =>
    storage.get(THEME_MODE_KEY) === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    storage.set(THEME_MODE_KEY, mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
