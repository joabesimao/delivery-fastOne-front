import type { ReactNode } from "react";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import {
  maxDailyVolume,
  type DashboardPerformance,
} from "../../domain/dashboardMetrics";

interface DeliveryPerformanceCardProps {
  performance: DashboardPerformance | undefined;
  loading: boolean;
}

const Indicator = ({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) => (
  <Stack alignItems="center" spacing={0.25}>
    <Stack direction="row" spacing={0.4} alignItems="center">
      {icon}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 800,
        ...(capitalize && { textTransform: "capitalize" }),
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const ICON_SX = { fontSize: 14, color: "text.secondary" };

const DeliveryPerformanceCard = ({
  performance,
  loading,
}: DeliveryPerformanceCardProps) => {
  const maxVolume = maxDailyVolume(performance);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Stack spacing={2} sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1.5}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Desempenho de Entregas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Volume de pedidos por dia no período selecionado
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Indicator
              icon={<ScheduleRoundedIcon sx={ICON_SX} />}
              label="Tempo médio"
              value={
                performance?.avgDeliveryMinutes != null
                  ? `${performance.avgDeliveryMinutes} min`
                  : "—"
              }
            />
            <Indicator
              icon={<BoltRoundedIcon sx={ICON_SX} />}
              label="Pico"
              value={performance?.peakDay?.label ?? "—"}
              capitalize
            />
            <Indicator
              icon={<Inventory2RoundedIcon sx={ICON_SX} />}
              label="Total"
              value={performance ? `${performance.totalOrders} entregas` : "—"}
            />
          </Stack>
        </Stack>

        {loading ? (
          <Skeleton variant="rounded" height={220} />
        ) : performance && performance.days.length > 0 ? (
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 3 }}
            alignItems="flex-end"
            sx={{ height: 220, px: 1 }}
          >
            {performance.days.map((item) => {
              const isPeak = performance.peakDay?.date === item.date;
              return (
                <Stack
                  key={item.date}
                  spacing={0.75}
                  alignItems="center"
                  sx={{ flex: 1, height: "100%", justifyContent: "flex-end" }}
                >
                  {isPeak && (
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {item.total}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 34,
                      borderRadius: "8px 8px 0 0",
                      height: `${(item.total / maxVolume) * 100}%`,
                      bgcolor: isPeak ? "primary.main" : alpha("#0EA5E9", 0.28),
                      transition: "height 240ms ease",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: isPeak ? "primary.main" : "text.secondary",
                      fontWeight: isPeak ? 800 : 600,
                      textTransform: "capitalize",
                    }}
                    noWrap
                  >
                    {item.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Box sx={{ height: 220, display: "grid", placeItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma entrega registrada no período.
            </Typography>
          </Box>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1}
          sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Dia de pico no período
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Tempo médio calculado a partir de pedidos finalizados
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export default DeliveryPerformanceCard;
