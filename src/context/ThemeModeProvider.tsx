import React, { useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider, CssBaseline, alpha } from "@mui/material";
import { ThemeModeContext } from "./ThemeModeContext";
import type { ThemeMode } from "./ThemeModeContext";

// ── Tokens ──────────────────────────────────────────────────────────────────
const ACCENT = "#4361EE";

const dark = {
  bgDefault:  "#0B0B12",
  bgPaper:    "#16161F",
  bgSidebar:  "#0F0F17",
  border:     "rgba(255,255,255,0.07)",
  textPrimary:"#E2E4EC",
  textSec:    "#7C7F8E",
  hover:      "rgba(255,255,255,0.05)",
  activeBg:   alpha(ACCENT, 0.16),
  inputBg:    "#1C1C28",
};

const light = {
  bgDefault:  "#F4F6F8",
  bgPaper:    "#FFFFFF",
  bgSidebar:  "#F4F5F7",
  border:     "#E2E4E9",
  textPrimary:"#1A1D23",
  textSec:    "#6B7280",
  hover:      "#ECEEF2",
  activeBg:   "#E8ECFF",
  inputBg:    "#FFFFFF",
};

const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("themeMode") as ThemeMode) ?? "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => {
    const t = mode === "dark" ? dark : light;

    return createTheme({
      palette: {
        mode,
        primary:    { main: ACCENT },
        background: { default: t.bgDefault, paper: t.bgPaper },
        text:       { primary: t.textPrimary, secondary: t.textSec },
        divider:    t.border,
      },
      shape: { borderRadius: 10 },
      typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: t.bgDefault,
              color: t.textPrimary,
              transition: "background-color 0.3s ease, color 0.3s ease",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: t.bgPaper,
              backgroundImage: "none",
              borderColor: t.border,
              transition: "background-color 0.3s ease",
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: { borderColor: t.border },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: t.inputBg,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: t.border,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: mode === "dark" ? "rgba(255,255,255,0.2)" : "#9CA3AF",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: ACCENT,
              },
            },
            input: {
              color: t.textPrimary,
              "&::placeholder": { color: t.textSec, opacity: 1 },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: { color: t.textSec },
          },
        },
        MuiSelect: {
          styleOverrides: {
            icon: { color: t.textSec },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: t.textPrimary,
              "&:hover": { backgroundColor: t.hover },
              "&.Mui-selected": {
                backgroundColor: t.activeBg,
                "&:hover": { backgroundColor: t.activeBg },
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            containedPrimary: {
              boxShadow: "none",
              "&:hover": { boxShadow: "none", backgroundColor: "#3451D1" },
            },
            outlinedInherit: {
              borderColor: t.border,
              color: t.textSec,
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: 10 },
          },
        },
      },
    });
  }, [mode]);

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
