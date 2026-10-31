import { Chip, useTheme } from "@mui/material";

import { COLORS } from "@/shared/theme/colors";
const IdChip = ({ id }: { id: number | string }) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Chip
      label={id}
      size="small"
      sx={{
        backgroundColor: isDark ? COLORS.navy : "#dbeafe",
        color: isDark ? COLORS.white : "#1e40af",
        fontWeight: 700,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

export default IdChip;
