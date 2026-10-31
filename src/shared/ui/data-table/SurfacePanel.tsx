import type { ReactNode } from "react";
import { Alert, Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";

interface SurfacePanelProps {
  title: string;
  description?: string;
  filters: ReactNode;
  loading: boolean;
  error: string | null;
  loaderColor?: string;
  children: ReactNode;
}

const SurfacePanel = ({
  title,
  description,
  filters,
  loading,
  error,
  loaderColor,
  children,
}: SurfacePanelProps) => {
  const colors = useSurfaceColors();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.cardBg,
        overflow: "hidden",
      }}
    >
      <Box px={3} py={2.5} sx={{ borderBottom: `1px solid ${colors.border}` }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: colors.textPrimary }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mt: 0.5 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        px={3}
        py={2.5}
        sx={{ borderBottom: `1px solid ${colors.border}` }}
      >
        {filters}
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: loaderColor }} />
        </Box>
      )}

      {error && (
        <Box px={3} py={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && !error && children}
    </Paper>
  );
};

export default SurfacePanel;
