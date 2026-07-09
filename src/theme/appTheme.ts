import { alpha, createTheme } from "@mui/material/styles";
import type { ThemeMode } from "../context/ThemeModeContext";

type ThemeTokens = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  hover: string;
  active: string;
  shadow: string;
};

const ACCENT = "#4f46e5";
const SECONDARY = "#0ea5e9";

const lightTokens: ThemeTokens = {
  background: "#f5f7fb",
  backgroundAlt: "#eef2ff",
  surface: "rgba(255, 255, 255, 0.92)",
  surfaceAlt: "#ffffff",
  border: "rgba(15, 23, 42, 0.08)",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  hover: alpha(ACCENT, 0.06),
  active: alpha(ACCENT, 0.12),
  shadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
};

const darkTokens: ThemeTokens = {
  background: "#090c16",
  backgroundAlt: "#111827",
  surface: "rgba(15, 23, 42, 0.84)",
  surfaceAlt: "#0f172a",
  border: "rgba(148, 163, 184, 0.14)",
  textPrimary: "#e2e8f0",
  textSecondary: "#94a3b8",
  hover: alpha("#ffffff", 0.04),
  active: alpha(ACCENT, 0.2),
  shadow: "0 22px 48px rgba(2, 6, 23, 0.48)",
};

const getTokens = (mode: ThemeMode) =>
  mode === "dark" ? darkTokens : lightTokens;

const createAppTheme = (mode: ThemeMode) => {
  const tokens = getTokens(mode);

  return createTheme({
    palette: {
      mode,
      primary: { main: ACCENT, contrastText: "#ffffff" },
      secondary: { main: SECONDARY },
      background: {
        default: tokens.background,
        paper: tokens.surfaceAlt,
      },
      text: {
        primary: tokens.textPrimary,
        secondary: tokens.textSecondary,
      },
      divider: tokens.border,
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Manrope", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h1: { fontWeight: 800, letterSpacing: -0.75 },
      h2: { fontWeight: 800, letterSpacing: -0.6 },
      h3: { fontWeight: 750, letterSpacing: -0.45 },
      h4: { fontWeight: 750, letterSpacing: -0.35 },
      h5: { fontWeight: 700, letterSpacing: -0.25 },
      h6: { fontWeight: 700, letterSpacing: -0.2 },
      subtitle1: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            colorScheme: mode,
            scrollBehavior: "smooth",
          },
          body: {
            backgroundColor: tokens.background,
            backgroundImage:
              mode === "light"
                ? `radial-gradient(circle at top left, ${alpha(ACCENT, 0.12)} 0, transparent 36%), radial-gradient(circle at 100% 0%, ${alpha(SECONDARY, 0.1)} 0, transparent 28%), linear-gradient(180deg, ${tokens.backgroundAlt} 0%, ${tokens.background} 100%)`
                : `radial-gradient(circle at top left, ${alpha(ACCENT, 0.16)} 0, transparent 36%), linear-gradient(180deg, #0f172a 0%, ${tokens.background} 100%)`,
            color: tokens.textPrimary,
            transition: "background-color 200ms ease, color 200ms ease",
          },
          "*::-webkit-scrollbar": {
            width: 10,
            height: 10,
          },
          "*::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor:
              mode === "dark"
                ? "rgba(148, 163, 184, 0.3)"
                : "rgba(100, 116, 139, 0.28)",
            borderRadius: 999,
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(18px)",
            borderBottom: `1px solid ${tokens.border}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: tokens.surface,
            borderRight: `1px solid ${tokens.border}`,
            backdropFilter: "blur(18px)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadow,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadow,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingLeft: 18,
            paddingRight: 18,
          },
          containedPrimary: {
            boxShadow: `0 12px 28px ${alpha(ACCENT, 0.22)}`,
          },
          outlinedPrimary: {
            borderColor: alpha(ACCENT, 0.34),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor:
              mode === "dark"
                ? "rgba(15, 23, 42, 0.72)"
                : "rgba(255, 255, 255, 0.88)",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(ACCENT, 0.35),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: ACCENT,
              borderWidth: 1,
            },
          },
          input: {
            paddingTop: 14,
            paddingBottom: 14,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          variant: "outlined",
          size: "small",
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: tokens.textSecondary,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#0f172a",
            borderRadius: 10,
            fontSize: 12,
            padding: "10px 12px",
            boxShadow: "0 18px 32px rgba(15, 23, 42, 0.22)",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44,
            textTransform: "none",
            fontWeight: 700,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 20,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 800,
            backgroundColor:
              mode === "dark"
                ? "rgba(15, 23, 42, 0.9)"
                : "rgba(248, 250, 252, 0.92)",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
    },
  });
};

export default createAppTheme;
