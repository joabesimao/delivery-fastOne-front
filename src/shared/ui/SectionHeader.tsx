import type { ElementType, ReactNode } from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface SectionHeaderProps {
  icon: ElementType;
  title: string;
  action?: ReactNode;
}

const SectionHeader = ({ icon: Icon, title, action }: SectionHeaderProps) => {
  const isDark = useTheme().palette.mode === "dark";

  const heading = (
    <Box display="flex" alignItems="center" gap={1} mb={action ? 0 : 3}>
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

  if (!action) return heading;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
      mb={3}
    >
      {heading}
      {action}
    </Box>
  );
};

export default SectionHeader;
