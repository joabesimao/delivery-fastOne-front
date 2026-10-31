import { useTheme } from "@mui/material";

const LIGHT = {
  cardBg: "#ffffff",
  border: "#e5e7eb",
  label: "#6b7280",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textBody: "#374151",
  inputBg: "#f9fafb",
  headerBg: "#f9fafb",
  rowHover: "#f0f7ff",
};

const DARK: typeof LIGHT = {
  cardBg: "#111827",
  border: "rgba(255,255,255,0.08)",
  label: "#9ca3af",
  textPrimary: "#f1f5f9",
  textSecondary: "#9ca3af",
  textBody: "#d1d5db",
  inputBg: "#1f2937",
  headerBg: "#1f2937",
  rowHover: "#1e2a3a",
};

export type SurfaceColors = typeof LIGHT;

export const useSurfaceColors = (): SurfaceColors & { isDark: boolean } => {
  const isDark = useTheme().palette.mode === "dark";
  return { ...(isDark ? DARK : LIGHT), isDark };
};

export const useSurfaceInputSx = () => {
  const { inputBg } = useSurfaceColors();
  return {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: inputBg,
      fontSize: 13,
    },
  };
};
