import type { ElementType } from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface SectionHeaderProps {
  icon: ElementType;
  title: string;
}

const SectionHeader = ({ icon: Icon, title }: SectionHeaderProps) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Box display="flex" alignItems="center" gap={1} mb={3}>
      <Icon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ color: isDark ? "#E2E4EC" : "#003459" }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default SectionHeader;
