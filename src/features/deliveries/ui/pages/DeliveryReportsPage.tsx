import { useMemo } from "react";
import { Alert, Box, Button, Grid, Stack, Typography } from "@mui/material";
import {
  countByNeighborhood,
  countByStatus,
  summarizeDeliveries,
  topDeliverymenPerformance,
} from "../../domain/deliveryReport";
import { useDeliveries } from "../../application/deliveryQueries";
import { useDeliveryRealtimeSync } from "../../application/useDeliveryRealtimeSync";
import DeliverymanPerformanceCard, {
  DeliverymanPerformanceSkeleton,
} from "../components/DeliverymanPerformanceCard";
import ReportCharts from "../components/ReportCharts";
import ReportStatCards from "../components/ReportStatCards";

const PERFORMANCE_GRID_SIZE = { xs: 12, md: 6, lg: 4 };

const DeliveryReportsPage = () => {
  const deliveriesQuery = useDeliveries();
  useDeliveryRealtimeSync();

  const loading = deliveriesQuery.isFetching;
  const deliveries = useMemo(
    () => (deliveriesQuery.isError ? [] : (deliveriesQuery.data ?? [])),
    [deliveriesQuery.data, deliveriesQuery.isError],
  );
  const report = useMemo(
    () => ({
      summary: summarizeDeliveries(deliveries),
      performance: topDeliverymenPerformance(deliveries),
      byNeighborhood: countByNeighborhood(deliveries),
      byStatus: countByStatus(deliveries),
    }),
    [deliveries],
  );

  return (
    <Stack spacing={2.2}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Relatorios de entregas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analise de desempenho por entregador, bairro e cidade
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box />
        <Button
          variant="outlined"
          onClick={() => void deliveriesQuery.refetch()}
          disabled={loading}
        >
          Atualizar dados
        </Button>
      </Stack>

      {deliveriesQuery.isError && (
        <Alert severity="error">Erro ao carregar relatorio de entregas.</Alert>
      )}

      <ReportStatCards summary={report.summary} loading={loading} />

      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1, fontWeight: 700 }}
        >
          DESEMPENHO POR ENTREGADOR
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {loading
          ? [0, 1, 2].map((index) => (
              <Grid key={index} size={PERFORMANCE_GRID_SIZE}>
                <DeliverymanPerformanceSkeleton />
              </Grid>
            ))
          : report.performance.map((item) => (
              <Grid key={item.key} size={PERFORMANCE_GRID_SIZE}>
                <DeliverymanPerformanceCard item={item} />
              </Grid>
            ))}
      </Grid>

      <ReportCharts
        loading={loading}
        byNeighborhood={report.byNeighborhood}
        byStatus={report.byStatus}
      />
    </Stack>
  );
};

export default DeliveryReportsPage;
