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
  bgDefault:  "#F7F9FC",
  bgPaper:    "#FCFDFF",
  bgSidebar:  "#FBFCFF",
  border:     "#DCE3F0",
  textPrimary:"#1A2333",
  textSec:    "#5E6A80",
  hover:      "#F2F6FF",
  activeBg:   "#E7EEFF",
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
        fontFamily: "'Manrope', 'Nunito Sans', 'Segoe UI', sans-serif",
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
              boxShadow:
                mode === "light"
                  ? "0 10px 28px rgba(46, 70, 116, 0.08)"
                  : "none",
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
            root: {
              borderRadius: 10,
            },
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
        MuiFormHelperText: {
          styleOverrides: {
            root: {
              marginLeft: 2,
              marginRight: 2,
            },
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
