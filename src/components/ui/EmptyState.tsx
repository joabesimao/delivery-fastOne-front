import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        borderRadius: 4,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 520 }}>
        {icon ? (
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: (theme) => theme.palette.action.hover,
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {action ? <Box>{action}</Box> : null}
      </Stack>
    </Paper>
  );
};

export default EmptyState;