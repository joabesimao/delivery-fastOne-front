import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Grid, Stack } from "@mui/material";
import { useDeliveries } from "@/features/deliveries";
import { ROUTES } from "@/shared/config/routes";
import { useResettablePage } from "@/shared/lib/hooks/useResettablePage";
import useRealtimeConnection from "@/shared/realtime/useRealtimeConnection";
import { session } from "@/shared/session/session";
import {
  LIVE_FEED_PAGE_SIZE,
  filterByStatus,
  greetingName,
  type DeliveryStatusFilter,
} from "../../domain/dashboardMetrics";
import {
  rangeForPeriod,
  todayInputRange,
  type DashboardPeriod,
  type DateInputRange,
} from "../../domain/dashboardPeriod";
import {
  useDashboardRealtimeSync,
  useDashboardSummary,
} from "../../application/dashboardQueries";
import DashboardHeader from "./DashboardHeader";
import DashboardStatGrid from "./DashboardStatGrid";
import DeliveryPerformanceCard from "./DeliveryPerformanceCard";
import LiveDeliveriesCard from "./LiveDeliveriesCard";
import TopDeliverymenCard from "./TopDeliverymenCard";

const TODAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const DashboardOverview = () => {
  const navigate = useNavigate();
  const connected = useRealtimeConnection();
  useDashboardRealtimeSync();

  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [customRange, setCustomRange] =
    useState<DateInputRange>(todayInputRange);
  const [status, setStatus] = useState<DeliveryStatusFilter>("all");
  const [page, setPage] = useResettablePage(status, 1);
  const [todayLabel] = useState(() => TODAY_FORMATTER.format(new Date()));

  const range = useMemo(
    () => rangeForPeriod(period, customRange),
    [period, customRange],
  );
  const summary = useDashboardSummary(range);
  const deliveriesQuery = useDeliveries();

  const filtered = useMemo(
    () => filterByStatus(deliveriesQuery.data ?? [], status),
    [deliveriesQuery.data, status],
  );
  const pageItems = filtered.slice(
    (page - 1) * LIVE_FEED_PAGE_SIZE,
    page * LIVE_FEED_PAGE_SIZE,
  );

  return (
    <Stack spacing={2.5}>
      <DashboardHeader
        greeting={greetingName(session.getUser())}
        todayLabel={todayLabel}
        connected={connected}
        period={period}
        customRange={customRange}
        onPeriodChange={setPeriod}
        onCustomRangeChange={(changes) =>
          setCustomRange((current) => ({ ...current, ...changes }))
        }
        onNewOrder={() =>
          navigate(ROUTES.deliveries, { state: { openCreate: true } })
        }
      />

      {summary.error && (
        <Alert severity="error">
          Não foi possível carregar os indicadores do dashboard.
        </Alert>
      )}

      <DashboardStatGrid metrics={summary.metrics} loading={summary.loading} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <DeliveryPerformanceCard
            performance={summary.performance}
            loading={summary.loading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <TopDeliverymenCard
            ranking={summary.ranking}
            loading={summary.loading}
            onViewAll={() => navigate(ROUTES.deliverymanReports)}
          />
        </Grid>
      </Grid>

      <LiveDeliveriesCard
        deliveries={pageItems}
        total={filtered.length}
        page={page}
        loading={deliveriesQuery.isPending || deliveriesQuery.isRefetching}
        status={status}
        onStatusChange={setStatus}
        onPageChange={setPage}
        onRefresh={() => void deliveriesQuery.refetch()}
        onChat={() => navigate(ROUTES.chat)}
        onViewDetails={() => navigate(ROUTES.deliveries)}
      />
    </Stack>
  );
};

export default DashboardOverview;
