import type { ReactNode } from "react";
import { Divider, Paper, Typography } from "@mui/material";

const SettingsPanel = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 3, md: 5 },
      maxWidth: 720,
      mx: "auto",
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
    }}
  >
    <Typography
      variant="h6"
      fontWeight={700}
      sx={{ mb: 3, textAlign: "center", color: "text.primary" }}
    >
      {title}
    </Typography>
    <Divider sx={{ mb: 4 }} />
    {children}
  </Paper>
);

export default SettingsPanel;
