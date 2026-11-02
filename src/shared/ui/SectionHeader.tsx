import type { ElementType, ReactNode } from "react";
import { Box, Typography, useTheme } from "@mui/material";

import { COLORS } from "@/shared/theme/colors";
interface SectionHeaderProps {
  icon: ElementType;
  title: string;
  action?: ReactNode;
}

const SectionHeader = ({ icon: Icon, title, action }: SectionHeaderProps) => {
  const isDark = useTheme().palette.mode === "dark";

  const heading = (
    <Box display="flex" alignItems="center" gap={1} mb={action ? 0 : 3}>
      <Icon
        sx={{ color: isDark ? COLORS.navySoft : COLORS.navy, fontSize: 28 }}
      />
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ color: isDark ? COLORS.inkOnDark : COLORS.navy }}
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
