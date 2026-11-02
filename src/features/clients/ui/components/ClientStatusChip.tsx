import { Chip } from "@mui/material";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";

const ClientStatusChip = ({ active }: { active: boolean }) => {
  const { isDark } = useSurfaceColors();
  const palette = active
    ? {
        bg: isDark ? "rgba(52,211,153,0.15)" : "#d1fae5",
        color: isDark ? "#34d399" : "#065f46",
      }
    : {
        bg: isDark ? "rgba(239,68,68,0.2)" : "#fee2e2",
        color: isDark ? "#fca5a5" : "#991b1b",
      };

  return (
    <Chip
      label={active ? "Ativo" : "Inativo"}
      size="small"
      sx={{
        bgcolor: palette.bg,
        color: palette.color,
        fontWeight: 600,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

export default ClientStatusChip;
