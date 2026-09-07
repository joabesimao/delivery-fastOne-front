import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import WifiTetheringRoundedIcon from "@mui/icons-material/WifiTetheringRounded";
import api from "../../services/api";
import { getRealtimeSocket } from "../../services/realtime";

type Period = "hoje" | "7dias" | "30dias" | "personalizado";

type StatCardItem = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "warning";
  hint: string;
  icon: ReactNode;
  color: string;
};

type BackendOrderStatus = "actived" | "delivered" | "finished";

type OrderDeliveryApiModel = {
  id: number;
  status: BackendOrderStatus;
  amount: number;
  deliveryman: { name: string; lastName: string } | null;
  Register: {
    client: { name: string; lastName: string; phone: string };
    address: { street: string; numberHouse: number; neighborhood: string; city: string };
  };
};

type OverviewResponse = {
  metrics: {
    clients: number;
    deliverymen: number;
    activeDeliveries: number;
    deliveredRevenue: number;
    deliveredRevenuePreviousPeriod: number | null;
    cities: number;
    neighborhoods: number;
  };
};

type PerformanceResponse = {
  days: Array<{ date: string; label: string; total: number }>;
  totalOrders: number;
  avgDeliveryMinutes: number | null;
  peakDay: { date: string; label: string; total: number } | null;
};

type RankingItem = {
  deliverymanId: number;
  deliverymanName: string;
  totalDeliveries: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const statusConfig: Record<BackendOrderStatus, { label: string; color: string; bg: string }> = {
  delivered: { label: "Em Trânsito", color: "#0EA5E9", bg: alpha("#0EA5E9", 0.12) },
  actived: { label: "Aguardando aceite", color: "#F59E0B", bg: alpha("#F59E0B", 0.14) },
  finished: { label: "Entregue", color: "#10B981", bg: alpha("#10B981", 0.14) },
};

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "30dias", label: "30 dias" },
  { value: "personalizado", label: "Personalizado" },
];

const ROWS_PER_PAGE = 5;

const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const getRangeForPeriod = (
  period: Period,
  customRange: { start: string; end: string },
): { startDate: string; endDate: string } => {
  const now = new Date();

  if (period === "7dias") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { startDate: startOfDay(start).toISOString(), endDate: endOfDay(now).toISOString() };
  }

  if (period === "30dias") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { startDate: startOfDay(start).toISOString(), endDate: endOfDay(now).toISOString() };
  }

  if (period === "personalizado") {
    const start = customRange.start ? new Date(`${customRange.start}T00:00:00`) : startOfDay(now);
    const end = customRange.end ? new Date(`${customRange.end}T23:59:59`) : endOfDay(now);
    return { startDate: startOfDay(start).toISOString(), endDate: endOfDay(end).toISOString() };
  }

  return { startDate: startOfDay(now).toISOString(), endDate: endOfDay(now).toISOString() };
};

const currentUserGreeting = (): string => {
  if (typeof window === "undefined") return "Operador";
  const email = localStorage.getItem("currentUserEmail") ?? "";
  if (!email) return "Operador";
  if (email.toLowerCase() === "admin@fastone.local") return "Operador Admin";
  return email;
};

const StatCard = ({ item, loading }: { item: StatCardItem; loading: boolean }) => (
  <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
    <Stack spacing={1.25} sx={{ p: 2.25 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
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

      <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 26, md: 30 }, lineHeight: 1 }}>
        {loading ? <Skeleton variant="text" width={90} /> : item.value}
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center">
        {item.delta ? (
          <Chip
            label={item.delta}
            size="small"
            color={item.deltaTone ?? "success"}
            variant="filled"
            sx={{ height: 20, fontSize: 11, fontWeight: 800, "& .MuiChip-label": { px: 0.9 } }}
          />
        ) : null}
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.hint}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

const DashboardIndex = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("hoje");
  const [customRange, setCustomRange] = useState(() => ({
    start: toInputDate(new Date()),
    end: toInputDate(new Date()),
  }));
  const [statusFilter, setStatusFilter] = useState<BackendOrderStatus | "todos">("todos");
  const [page, setPage] = useState(1);

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [orders, setOrders] = useState<OrderDeliveryApiModel[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const { startDate, endDate } = useMemo(
    () => getRangeForPeriod(period, customRange),
    [period, customRange],
  );

  const loadSummary = async () => {
    setLoadingSummary(true);
    setError(null);

    try {
      const [overviewRes, performanceRes, rankingRes] = await Promise.all([
        api.get<OverviewResponse>("/dashboard/overview", { params: { startDate, endDate } }),
        api.get<PerformanceResponse>("/dashboard/performance", { params: { startDate, endDate } }),
        api.get<{ items: RankingItem[] }>("/orderDelivery/ranking/deliveryman", {
          params: { startDate, endDate, status: "all", page: 1, pageSize: 3 },
        }),
      ]);

      setOverview(overviewRes.data);
      setPerformance(performanceRes.data);
      setRanking(Array.isArray(rankingRes.data?.items) ? rankingRes.data.items : []);
    } catch {
      setError("Não foi possível carregar os indicadores do dashboard.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);

    try {
      const response = await api.get<OrderDeliveryApiModel[]>("/orderDelivery");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const socket = getRealtimeSocket();
    if (!socket) return;

    setSocketConnected(socket.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onDeliveryChanged = () => {
      void loadOrders();
      void loadSummary();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("delivery:changed", onDeliveryChanged);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("delivery:changed", onDeliveryChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revenueDelta = useMemo(() => {
    const previous = overview?.metrics.deliveredRevenuePreviousPeriod;
    const current = overview?.metrics.deliveredRevenue;
    if (previous === null || previous === undefined || current === undefined || previous === 0) {
      return null;
    }
    const percent = ((current - previous) / previous) * 100;
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
  }, [overview]);

  const statCards = useMemo((): StatCardItem[] => {
    const metrics = overview?.metrics;

    return [
      {
        label: "Entregas em andamento",
        value: metrics ? String(metrics.activeDeliveries) : "—",
        hint: "no período selecionado",
        icon: <Inventory2RoundedIcon fontSize="small" />,
        color: "#0EA5E9",
      },
      {
        label: "Receita entregue",
        value: metrics ? currencyFormatter.format(metrics.deliveredRevenue) : "—",
        delta: revenueDelta ?? undefined,
        deltaTone: revenueDelta?.startsWith("-") ? "warning" : "success",
        hint: "no período",
        icon: <MonetizationOnOutlinedIcon fontSize="small" />,
        color: "#10B981",
      },
      {
        label: "Total de Clientes",
        value: metrics ? String(metrics.clients) : "—",
        hint: "cadastrados no sistema",
        icon: <GroupOutlinedIcon fontSize="small" />,
        color: "#8B5CF6",
      },
      {
        label: "Entregadores Cadastrados",
        value: metrics ? String(metrics.deliverymen) : "—",
        hint: "na frota",
        icon: <TwoWheelerOutlinedIcon fontSize="small" />,
        color: "#F59E0B",
      },
      {
        label: "Cidades atendidas",
        value: metrics ? String(metrics.cities) : "—",
        hint: "cadastradas",
        icon: <LocationCityOutlinedIcon fontSize="small" />,
        color: "#0891B2",
      },
      {
        label: "Bairros atendidos",
        value: metrics ? String(metrics.neighborhoods) : "—",
        hint: "mapeados",
        icon: <MapOutlinedIcon fontSize="small" />,
        color: "#4F46E5",
      },
    ];
  }, [overview, revenueDelta]);

  const maxVolume = useMemo(() => {
    if (!performance?.days.length) return 1;
    return Math.max(...performance.days.map((d) => d.total), 1);
  }, [performance]);

  const filteredOrders = useMemo(
    () => (statusFilter === "todos" ? orders : orders.filter((order) => order.status === statusFilter)),
    [orders, statusFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / ROWS_PER_PAGE));
  const pagedOrders = filteredOrders.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(
        new Date(),
      ),
    [],
  );

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        gap={1.5}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Olá, {currentUserGreeting()}
            </Typography>
            <Chip
              label={socketConnected ? "Sincronização ativa" : "Reconectando..."}
              color={socketConnected ? "success" : "warning"}
              size="small"
              sx={{ fontWeight: 700, "& .MuiChip-label": { px: 1.2 } }}
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <CalendarTodayRoundedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                {todayLabel}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <WifiTetheringRoundedIcon
                sx={{ fontSize: 15, color: socketConnected ? "success.main" : "text.disabled" }}
              />
              <Typography variant="body2" color="text.secondary">
                {socketConnected ? "Conectado em tempo real" : "Sem conexão em tempo real"}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={period}
            onChange={(_, value) => value && setPeriod(value)}
            sx={{
              bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
              borderRadius: 999,
              p: 0.4,
              "& .MuiToggleButtonGroup-grouped": {
                border: 0,
                borderRadius: "999px !important",
                px: 1.5,
                fontWeight: 700,
                fontSize: 12.5,
                textTransform: "none",
              },
            }}
          >
            {periodOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {period === "personalizado" ? (
            <Stack direction="row" spacing={1}>
              <TextField
                type="date"
                size="small"
                value={customRange.start}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
              />
              <TextField
                type="date"
                size="small"
                value={customRange.end}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </Stack>
          ) : null}

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/listagem-entregas", { state: { openCreate: true } })}
            sx={{ borderRadius: 999, px: 2.5, whiteSpace: "nowrap" }}
          >
            Novo Pedido
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {statCards.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <StatCard item={item} loading={loadingSummary} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
            <Stack spacing={2} sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Desempenho de Entregas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Volume de pedidos por dia no período selecionado
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Stack alignItems="center" spacing={0.25}>
                    <Stack direction="row" spacing={0.4} alignItems="center">
                      <ScheduleRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Tempo médio
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {performance?.avgDeliveryMinutes != null ? `${performance.avgDeliveryMinutes} min` : "—"}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.25}>
                    <Stack direction="row" spacing={0.4} alignItems="center">
                      <BoltRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Pico
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: "capitalize" }}>
                      {performance?.peakDay?.label ?? "—"}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.25}>
                    <Stack direction="row" spacing={0.4} alignItems="center">
                      <Inventory2RoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {performance ? `${performance.totalOrders} entregas` : "—"}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {loadingSummary ? (
                <Skeleton variant="rounded" height={220} />
              ) : performance && performance.days.length > 0 ? (
                <Stack direction="row" spacing={{ xs: 1.5, sm: 3 }} alignItems="flex-end" sx={{ height: 220, px: 1 }}>
                  {performance.days.map((item) => {
                    const isPeak = performance.peakDay?.date === item.date;
                    return (
                      <Stack
                        key={item.date}
                        spacing={0.75}
                        alignItems="center"
                        sx={{ flex: 1, height: "100%", justifyContent: "flex-end" }}
                      >
                        {isPeak ? (
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>
                            {item.total}
                          </Typography>
                        ) : null}
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
                          sx={{ color: isPeak ? "primary.main" : "text.secondary", fontWeight: isPeak ? 800 : 600, textTransform: "capitalize" }}
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
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main" }} />
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
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
            <Stack spacing={1.75} sx={{ p: 2.5, height: "100%" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Top Entregadores
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ranking no período selecionado
                </Typography>
              </Box>

              <Stack spacing={1.25} sx={{ flex: 1 }}>
                {loadingSummary ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={62} />
                  ))
                ) : ranking.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma entrega finalizada no período.
                  </Typography>
                ) : (
                  ranking.map((deliverer, index) => (
                    <Stack
                      key={deliverer.deliverymanId}
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                      sx={{ p: 1.25, borderRadius: 2.5, border: 1, borderColor: "divider" }}
                    >
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#fff",
                          bgcolor: ["#F59E0B", "#94A3B8", "#B45309"][index] ?? "#64748B",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>

                      <Avatar sx={{ width: 38, height: 38, bgcolor: "secondary.main", fontSize: 13 }}>
                        {deliverer.deliverymanName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                          {deliverer.deliverymanName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Entregador
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                          {deliverer.totalDeliveries}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          entregas
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                )}
              </Stack>

              <Button
                fullWidth
                onClick={() => navigate("/relatorios-entregas/entregadores")}
                sx={{ fontWeight: 700, justifyContent: "space-between" }}
                endIcon={<AddRoundedIcon sx={{ transform: "rotate(45deg)" }} fontSize="small" />}
              >
                Ver classificação completa da frota
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Últimas Entregas em Tempo Real
                </Typography>
                <Chip
                  icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main" }} />}
                  label="Live Feed"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Todos os pedidos cadastrados, com status e entregador responsável
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Select
                size="small"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as BackendOrderStatus | "todos")}
                sx={{ minWidth: 168, borderRadius: 999 }}
              >
                <MenuItem value="todos">Todos os Status</MenuItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <MenuItem key={value} value={value}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
              <Tooltip title="Atualizar">
                <IconButton onClick={() => void loadOrders()}>
                  <RefreshRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>ID Pedido</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Destino e bairro</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Entregador responsável</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Valor</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingOrders
                  ? Array.from({ length: ROWS_PER_PAGE }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 7 }).map((__, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : pagedOrders.map((order) => {
                      const status = statusConfig[order.status];
                      const clientName = `${order.Register.client.name} ${order.Register.client.lastName}`.trim();
                      const deliverymanName = order.deliveryman
                        ? `${order.deliveryman.name} ${order.deliveryman.lastName}`.trim()
                        : null;
                      const address = order.Register.address;

                      return (
                        <TableRow key={order.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                              {clientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {order.Register.client.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {address.street}, {address.numberHouse}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {address.neighborhood}, {address.city}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {deliverymanName ? (
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "secondary.main" }}>
                                  {deliverymanName.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" noWrap>
                                  {deliverymanName}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                Não atribuído
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{currencyFormatter.format(order.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Conversar">
                              <IconButton size="small" onClick={() => navigate("/chat")}>
                                <ChatBubbleOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Ver detalhes">
                              <IconButton size="small" onClick={() => navigate("/listagem-entregas")}>
                                <RemoveRedEyeOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mais opções">
                              <IconButton size="small">
                                <MoreVertRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                {!loadingOrders && pagedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        Nenhum pedido encontrado para o filtro selecionado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Mostrando {pagedOrders.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1} a{" "}
              {Math.min(page * ROWS_PER_PAGE, filteredOrders.length)} de {filteredOrders.length} pedidos
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {Array.from({ length: pageCount }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <Chip
                    key={pageNumber}
                    label={pageNumber}
                    size="small"
                    onClick={() => setPage(pageNumber)}
                    color={pageNumber === page ? "primary" : "default"}
                    variant={pageNumber === page ? "filled" : "outlined"}
                    sx={{ fontWeight: 700, minWidth: 30, cursor: "pointer" }}
                  />
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default DashboardIndex;
