import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import TagIcon from "@mui/icons-material/Tag";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
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
import api from "../../services/api";
import { getRealtimeSocket } from "../../services/realtime";

type DeliveryStatus = "actived" | "delivered" | "finished";

interface OrderData {
  id: number;
  amount: number;
  status: DeliveryStatus;
  deliverymanId?: number | null;
  deliveryman?: {
    id: number;
    name: string;
    lastName: string;
    phone: string;
  } | null;
  Register: {
    address: {
      neighborhood: string;
      city: string;
    };
  };
}

type DeliverymanStats = {
  key: string;
  name: string;
  phone: string;
  total: number;
  finished: number;
  active: number;
  revenue: number;
  completionRate: number;
};

const statusLabel: Record<DeliveryStatus, string> = {
  actived: "Aberto",
  delivered: "Em entrega",
  finished: "Finalizado",
};

const statusColors: Record<DeliveryStatus, string> = {
  actived: "#ff7a1a",
  delivered: "#3b82f6",
  finished: "#a855f7",
};

const cardIconColor = ["#8b5cf6", "#10b981", "#f97316", "#3b82f6"];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const RelatoriosEntregasGeral = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<OrderData[]>("/orderDelivery");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Erro ao carregar relatorio de entregas.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket) {
      return;
    }

    const onDeliveryChanged = () => {
      void loadOrders();
    };

    socket.on("delivery:changed", onDeliveryChanged);

    return () => {
      socket.off("delivery:changed", onDeliveryChanged);
    };
  }, []);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const finishedOrders = orders.filter((order) => order.status === "finished");
    const finishedCount = finishedOrders.length;
    const totalRevenue = finishedOrders.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const averageTicket = finishedCount > 0 ? totalRevenue / finishedCount : 0;

    return {
      totalOrders,
      finishedCount,
      totalRevenue,
      averageTicket,
    };
  }, [orders]);

  const deliverymanPerformance = useMemo(() => {
    const map = new Map<string, DeliverymanStats>();

    orders.forEach((order) => {
      const deliverymanName = order.deliveryman
        ? `${order.deliveryman.name} ${order.deliveryman.lastName}`.trim()
        : "Sem entregador";
      const key = order.deliverymanId ? `dm-${order.deliverymanId}` : `order-${order.id}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: deliverymanName,
          phone: order.deliveryman?.phone || "-",
          total: 0,
          finished: 0,
          active: 0,
          revenue: 0,
          completionRate: 0,
        });
      }

      const current = map.get(key);
      if (!current) return;

      current.total += 1;

      if (order.status === "finished") {
        current.finished += 1;
        current.revenue += Number(order.amount || 0);
      } else {
        current.active += 1;
      }
    });

    const items = Array.from(map.values())
      .map((item) => ({
        ...item,
        completionRate: item.total > 0 ? Math.round((item.finished / item.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total || b.revenue - a.revenue || a.name.localeCompare(b.name));

    return items.slice(0, 3);
  }, [orders]);

  const byNeighborhood = useMemo(() => {
    const countByNeighborhood = new Map<string, number>();

    orders.forEach((order) => {
      const key = order.Register?.address?.neighborhood?.trim() || "Sem bairro";
      countByNeighborhood.set(key, (countByNeighborhood.get(key) ?? 0) + 1);
    });

    return Array.from(countByNeighborhood.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
      .slice(0, 7);
  }, [orders]);

  const byStatus = useMemo(() => {
    const totals: Record<DeliveryStatus, number> = {
      actived: 0,
      delivered: 0,
      finished: 0,
    };

    orders.forEach((order) => {
      totals[order.status] += 1;
    });

    return Object.entries(totals).map(([status, value]) => ({
      status: status as DeliveryStatus,
      name: statusLabel[status as DeliveryStatus],
      value,
      color: statusColors[status as DeliveryStatus],
    }));
  }, [orders]);

  const statCards = [
    {
      icon: <TagIcon fontSize="small" />,
      iconColor: cardIconColor[0],
      value: summary.totalOrders,
      label: "TOTAL DE PEDIDOS",
    },
    {
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      iconColor: cardIconColor[1],
      value: summary.finishedCount,
      label: "FINALIZADOS",
    },
    {
      icon: <MonetizationOnOutlinedIcon fontSize="small" />,
      iconColor: cardIconColor[2],
      value: currencyFormatter.format(summary.totalRevenue),
      label: "RECEITA TOTAL",
    },
    {
      icon: <TrendingUpOutlinedIcon fontSize="small" />,
      iconColor: cardIconColor[3],
      value: currencyFormatter.format(summary.averageTicket),
      label: "TICKET MEDIO",
    },
  ];

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

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
        <Box />
        <Button variant="outlined" onClick={() => void loadOrders()} disabled={loading}>
          Atualizar dados
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {statCards.map((card, index) => (
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
                    color: card.iconColor,
                    bgcolor: (theme) => alpha(card.iconColor, theme.palette.mode === "dark" ? 0.2 : 0.12),
                  }}
                >
                  {loading ? <Skeleton variant="circular" width={16} height={16} /> : card.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: 31, md: 40 } }}>
                  {loading ? <Skeleton variant="text" width={index >= 2 ? 130 : 70} /> : card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
                  {card.label}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 700 }}>
          DESEMPENHO POR ENTREGADOR
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Grid key={`loading-delivery-${index}`} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
                  <Stack spacing={1.5} sx={{ p: 2.2 }}>
                    <Skeleton variant="text" width={140} />
                    <Skeleton variant="text" width={90} />
                    <Skeleton variant="rounded" height={6} />
                    <Grid container spacing={1}>
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <Grid key={idx} size={{ xs: 4 }}>
                          <Skeleton variant="rounded" height={50} />
                        </Grid>
                      ))}
                    </Grid>
                    <Skeleton variant="text" width={120} />
                  </Stack>
                </Card>
              </Grid>
            ))
          : deliverymanPerformance.map((item) => (
              <Grid key={item.key} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
                  <Stack spacing={1.4} sx={{ p: 2.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Chip
                          label={item.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part: string) => part.charAt(0).toUpperCase())
                            .join("")
                            .slice(0, 2)}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.phone}
                          </Typography>
                        </Box>
                      </Stack>

                      {item.completionRate === 100 ? (
                        <StarBorderIcon sx={{ fontSize: 16, color: "warning.main" }} />
                      ) : null}
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Taxa de conclusao
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {item.completionRate}%
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={item.completionRate}
                      sx={{
                        height: 5,
                        borderRadius: 99,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 99,
                        },
                      }}
                    />

                    <Grid container spacing={1}>
                      <Grid size={{ xs: 4 }}>
                        <Card sx={{ p: 1.2, borderRadius: 2, border: 1, borderColor: "divider" }}>
                          <Typography variant="h6" sx={{ textAlign: "center", fontWeight: 800, lineHeight: 1.1 }}>
                            {item.total}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                            Total
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Card sx={{ p: 1.2, borderRadius: 2, border: 1, borderColor: "divider" }}>
                          <Typography variant="h6" sx={{ textAlign: "center", fontWeight: 800, lineHeight: 1.1 }}>
                            {item.finished}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                            Concluidos
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Card sx={{ p: 1.2, borderRadius: 2, border: 1, borderColor: "divider" }}>
                          <Typography variant="h6" sx={{ textAlign: "center", fontWeight: 800, lineHeight: 1.1 }}>
                            {item.active}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                            Ativas
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Receita gerada
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {currencyFormatter.format(item.revenue)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
            <Stack spacing={1.3} sx={{ p: 2.2, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Entregas por bairro
              </Typography>
              <Box sx={{ width: "100%", height: 220 }}>
                {loading ? (
                  <Skeleton variant="rounded" height={220} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byNeighborhood} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
            <Stack spacing={1.3} sx={{ p: 2.2, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Distribuicao por status
              </Typography>
              <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box sx={{ width: "100%", height: 220 }}>
                    {loading ? (
                      <Skeleton variant="circular" width={200} height={200} sx={{ mx: "auto" }} />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byStatus}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={1}
                          >
                            {byStatus.map((item) => (
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
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton key={`status-loading-${index}`} variant="text" width="100%" height={26} />
                        ))
                      : byStatus.map((item) => (
                          <Stack key={item.status} direction="row" spacing={1.2} alignItems="center">
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
                              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
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
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default RelatoriosEntregasGeral;
