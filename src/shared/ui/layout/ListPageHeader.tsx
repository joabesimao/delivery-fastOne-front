import type { ReactNode } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";

interface ListPageHeaderProps {
  title: string;
  description: string;
  badge?: string | number;
  actions?: ReactNode;
}

const ListPageHeader = ({
  title,
  description,
  badge,
  actions,
}: ListPageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    gap={1.5}
  >
    <Box>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
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
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    {actions}
  </Stack>
);

export default ListPageHeader;
