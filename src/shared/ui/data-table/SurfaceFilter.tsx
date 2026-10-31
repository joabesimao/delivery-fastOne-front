import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";

interface SurfaceFilterProps {
  label: string;
  minWidth: number;
  children: ReactNode;
}

const SurfaceFilter = ({ label, minWidth, children }: SurfaceFilterProps) => {
  const colors = useSurfaceColors();
  return (
    <Box flex="1" minWidth={minWidth}>
      <Typography
        variant="caption"
        sx={{ color: colors.label, fontWeight: 600, mb: 0.5, display: "block" }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
};

export default SurfaceFilter;
