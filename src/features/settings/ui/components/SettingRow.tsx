import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface SettingRowProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
  wrap?: boolean;
}

const SettingRow = ({
  icon,
  title,
  description,
  action,
  wrap = false,
}: SettingRowProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      p: 2.5,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.default",
      ...(wrap && { gap: 2, flexWrap: "wrap" }),
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      {icon}
      <Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
    {action}
  </Box>
);

export default SettingRow;
