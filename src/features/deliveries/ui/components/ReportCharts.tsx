import type { ReactNode } from "react";
import { Box, Card, Grid, Skeleton, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DeliveryStatus } from "../../domain/delivery";
import type { CountByName } from "../../domain/deliveryReport";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  actived: "Aberto",
  delivered: "Em entrega",
  finished: "Finalizado",
};

const STATUS_COLOR: Record<DeliveryStatus, string> = {
  actived: "#ff7a1a",
  delivered: "#3b82f6",
  finished: "#a855f7",
};

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Grid size={{ xs: 12, lg: 6 }}>
    <Card
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Stack spacing={1.3} sx={{ p: 2.2, height: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {children}
      </Stack>
    </Card>
  </Grid>
);

interface ReportChartsProps {
  loading: boolean;
  byNeighborhood: CountByName[];
  byStatus: { status: DeliveryStatus; value: number }[];
}

const ReportCharts = ({
  loading,
  byNeighborhood,
  byStatus,
}: ReportChartsProps) => {
  const statusData = byStatus.map((item) => ({
    ...item,
    name: STATUS_LABEL[item.status],
    color: STATUS_COLOR[item.status],
  }));

  return (
    <Grid container spacing={2}>
      <ChartCard title="Entregas por bairro">
        <Box sx={{ width: "100%", height: 220 }}>
          {loading ? (
            <Skeleton variant="rounded" height={220} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byNeighborhood}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byNeighborhood.map((entry) => (
                    <Cell key={entry.name} fill="#ff7a1a" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </ChartCard>

      <ChartCard title="Distribuicao por status">
        <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Box sx={{ width: "100%", height: 220 }}>
              {loading ? (
                <Skeleton
                  variant="circular"
                  width={200}
                  height={200}
                  sx={{ mx: "auto" }}
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={1}
                    >
                      {statusData.map((item) => (
                        <Cell key={item.status} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }}>
            <Stack spacing={1}>
              {loading
                ? [0, 1, 2].map((index) => (
                    <Skeleton
                      key={index}
                      variant="text"
                      width="100%"
                      height={26}
                    />
                  ))
                : statusData.map((item) => (
                    <Stack
                      key={item.status}
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: 99,
                          bgcolor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, lineHeight: 1.1 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.value} pedido(s)
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
            </Stack>
          </Grid>
        </Grid>
      </ChartCard>
    </Grid>
  );
};

export default ReportCharts;
