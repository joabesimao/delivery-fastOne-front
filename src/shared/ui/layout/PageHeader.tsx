import type { ReactNode } from "react";
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  badge?: string | number;
  icon?: ReactNode;
  actions?: ReactNode;
}

const PageHeader = ({
  title,
  description,
  eyebrow,
  badge,
  icon,
  actions,
}: PageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    gap={1.5}
  >
    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
      {icon && (
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            boxShadow: 3,
          }}
        >
          {icon}
        </Avatar>
      )}
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Chip
            label={eyebrow}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {badge !== undefined && (
            <Chip
              label={badge}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, "& .MuiChip-label": { px: 1.1 } }}
            />
          )}
        </Stack>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
    </Stack>
    {actions}
  </Stack>
);

export default PageHeader;
