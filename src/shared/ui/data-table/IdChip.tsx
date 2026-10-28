import { Chip, useTheme } from "@mui/material";

const IdChip = ({ id }: { id: number | string }) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Chip
      label={id}
      size="small"
      sx={{
        backgroundColor: isDark ? "#003459" : "#dbeafe",
        color: isDark ? "#fff" : "#1e40af",
        fontWeight: 700,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

export default IdChip;
