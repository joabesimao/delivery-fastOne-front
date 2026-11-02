import type { ReactNode } from "react";
import { Box, Card, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export interface DashboardStatItem {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "warning";
  hint: string;
  icon: ReactNode;
  color: string;
}

const DashboardStatCard = ({
  item,
  loading,
}: {
  item: DashboardStatItem;
  loading: boolean;
}) => (
  <Card
    sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}
  >
    <Stack spacing={1.25} sx={{ p: 2.25 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
        >
          {item.label}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(item.color, 0.14),
            color: item.color,
          }}
        >
          {item.icon}
        </Box>
      </Stack>

      <Typography
        variant="h4"
        sx={{ fontWeight: 800, fontSize: { xs: 26, md: 30 }, lineHeight: 1 }}
      >
        {loading ? <Skeleton variant="text" width={90} /> : item.value}
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center">
        {item.delta && (
          <Chip
            label={item.delta}
            size="small"
            color={item.deltaTone ?? "success"}
            variant="filled"
            sx={{
              height: 20,
              fontSize: 11,
              fontWeight: 800,
              "& .MuiChip-label": { px: 0.9 },
            }}
          />
        )}
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.hint}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

export default DashboardStatCard;
