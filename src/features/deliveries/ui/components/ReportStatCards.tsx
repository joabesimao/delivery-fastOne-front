import type { ReactNode } from "react";
import { Box, Card, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import TagIcon from "@mui/icons-material/Tag";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { formatCurrency } from "@/shared/lib/format/currency";
import type { DeliverySummary } from "../../domain/deliveryReport";

interface ReportStatCardsProps {
  summary: DeliverySummary;
  loading: boolean;
}

interface StatCardConfig {
  icon: ReactNode;
  color: string;
  value: string | number;
  label: string;
  skeletonWidth: number;
}

const ReportStatCards = ({ summary, loading }: ReportStatCardsProps) => {
  const cards: StatCardConfig[] = [
    {
      icon: <TagIcon fontSize="small" />,
      color: "#8b5cf6",
      value: summary.totalOrders,
      label: "TOTAL DE PEDIDOS",
      skeletonWidth: 70,
    },
    {
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      color: "#10b981",
      value: summary.finishedCount,
      label: "FINALIZADOS",
      skeletonWidth: 70,
    },
    {
      icon: <MonetizationOnOutlinedIcon fontSize="small" />,
      color: "#f97316",
      value: formatCurrency(summary.totalRevenue),
      label: "RECEITA TOTAL",
      skeletonWidth: 130,
    },
    {
      icon: <TrendingUpOutlinedIcon fontSize="small" />,
      color: "#3b82f6",
      value: formatCurrency(summary.averageTicket),
      label: "TICKET MEDIO",
      skeletonWidth: 130,
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
            <Stack spacing={1} sx={{ p: 2.2 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: card.color,
                  bgcolor: (theme) =>
                    alpha(
                      card.color,
                      theme.palette.mode === "dark" ? 0.2 : 0.12,
                    ),
                }}
              >
                {loading ? (
                  <Skeleton variant="circular" width={16} height={16} />
                ) : (
                  card.icon
                )}
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: { xs: 31, md: 40 } }}
              >
                {loading ? (
                  <Skeleton variant="text" width={card.skeletonWidth} />
                ) : (
                  card.value
                )}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ letterSpacing: 0.6 }}
              >
                {card.label}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportStatCards;
