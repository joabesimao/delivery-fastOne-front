import type { ReactNode } from "react";
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

const PageHeader = ({ title, description, eyebrow, actions, icon }: PageHeaderProps) => {
  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          {icon ? (
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
          ) : null}

          <Box sx={{ minWidth: 0 }}>
            {eyebrow ? (
              <Chip
                label={eyebrow}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ) : null}

            <Typography variant="h4" component="h1" sx={{ mb: description ? 1 : 0 }}>
              {title}
            </Typography>

            {description ? (
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
      </Stack>
    </Stack>
  );
};

export default PageHeader;