import type { ReactNode } from "react";
import { alpha } from "@mui/material/styles";
import { Box, Paper, Stack, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
}

const StatCard = ({ label, value, description, icon }: StatCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2.5,
        borderRadius: 4,
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) => theme.shadows[8],
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.32),
        },
      }}
    >
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>

          {icon ? (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Stack>

        <Typography variant="h3" component="p" sx={{ lineHeight: 1, fontSize: { xs: 28, md: 34 } }}>
          {value}
        </Typography>

        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default StatCard;