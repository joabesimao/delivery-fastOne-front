import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import api from "../../services/api";

type DeliveryStatus = "actived" | "delivered" | "finished";

type TopCardItem = {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
};

type FooterCardItem = {
  label: string;
  value: number;
  icon: ReactNode;
};

interface DashboardOverviewResponse {
  metrics: {
    clients: number;
    deliverymen: number;
    activeDeliveries: number;
    deliveredRevenue: number;
    cities: number;
    neighborhoods: number;
  };
  latestDeliveries: Array<{
    id: number;
    status: DeliveryStatus;
    amount: number;
    clientName: string;
    deliverymanName: string;
  }>;
}

const statusLabel: Record<DeliveryStatus, string> = {
  actived: "Aberto",
  delivered: "Em entrega",
  finished: "Finalizado",
};

const statusColor: Record<DeliveryStatus, "warning" | "info" | "success"> = {
  actived: "warning",
  delivered: "info",
  finished: "success",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const DashboardIndex = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get<DashboardOverviewResponse>("/dashboard/overview")
      .then((response) => {
        if (!active) return;
        setOverview(response.data);
      })
      .catch(() => {
        if (!active) return;
        setError("Nao foi possivel carregar os dados do dashboard.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = overview?.metrics;
  const latestDeliveries = overview?.latestDeliveries ?? [];

  const topCards = useMemo(
    (): TopCardItem[] => [
      {
        label: "Clientes",
        value: metrics?.clients ?? 0,
        icon: <GroupOutlinedIcon fontSize="small" />,
        color: "#8B5CF6",
      },
      {
        label: "Entregadores",
        value: metrics?.deliverymen ?? 0,
        icon: <TwoWheelerOutlinedIcon fontSize="small" />,
        color: "#3B82F6",
      },
      {
        label: "Entregas ativas",
        value: metrics?.activeDeliveries ?? 0,
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
        color: "#F59E0B",
      },
      {
        label: "Receita entregue",
        value: currencyFormatter.format(metrics?.deliveredRevenue ?? 0),
        icon: <MonetizationOnOutlinedIcon fontSize="small" />,
        color: "#10B981",
      },
    ],
    [metrics],
  );

  const quickActions = [
    {
      title: "Novo pedido",
      description: "Registrar entrega para cliente",
      icon: <AddShoppingCartOutlinedIcon fontSize="small" />,
      path: "/realizar-entrega",
    },
    {
      title: "Finalizar entrega",
      description: "Concluir pedidos em andamento",
      icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
      path: "/finalizar-entrega",
    },
    {
      title: "Relatorios",
      description: "Ver desempenho e estatisticas",
      icon: <ReceiptLongOutlinedIcon fontSize="small" />,
      path: "/dashboard/relatorios",
    },
  ];

  const footerCards = useMemo(
    (): FooterCardItem[] => [
      {
        label: "Cidades",
        value: metrics?.cities ?? 0,
        icon: <LocationCityOutlinedIcon fontSize="small" />,
      },
      {
        label: "Bairros",
        value: metrics?.neighborhoods ?? 0,
        icon: <MapOutlinedIcon fontSize="small" />,
      },
      {
        label: "Clientes",
        value: metrics?.clients ?? 0,
        icon: <GroupOutlinedIcon fontSize="small" />,
      },
      {
        label: "Entregadores",
        value: metrics?.deliverymen ?? 0,
        icon: <TwoWheelerOutlinedIcon fontSize="small" />,
      },
    ],
    [metrics],
  );

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: 1.2,
            }}
          >
            PAINEL GERAL
          </Typography>
          <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 800 }}>
            Dashboard
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddShoppingCartOutlinedIcon />}
          onClick={() => navigate("/realizar-entrega")}
          sx={{ borderRadius: 999, px: 2.5 }}
        >
          Novo pedido
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {(loading ? Array.from({ length: 4 }) : topCards).map((_, index) => (
          <Grid key={`top-card-${index}`} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
              <Stack spacing={1.25} sx={{ p: 2.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: (theme) =>
                      alpha(
                        loading
                          ? theme.palette.text.disabled
                          : topCards[index].color,
                        loading ? 0.14 : 0.16,
                      ),
                    color: loading ? "text.disabled" : topCards[index].color,
                  }}
                >
                  {loading ? <Skeleton variant="circular" width={18} height={18} /> : topCards[index].icon}
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: 30, md: 36 }, fontWeight: 750, lineHeight: 1 }}>
                  {loading ? <Skeleton variant="text" width={90} /> : topCards[index].value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                  {loading ? <Skeleton variant="text" width={120} /> : topCards[index].label}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
            <Stack spacing={1.2} sx={{ p: 2.2 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                ACOES RAPIDAS
              </Typography>

              {quickActions.map((action) => (
                <Box
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 1.6,
                    py: 1.35,
                    cursor: "pointer",
                    transition: "all 160ms ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ color: "text.secondary", display: "grid", placeItems: "center" }}>
                        {action.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {action.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {action.description}
                        </Typography>
                      </Box>
                    </Stack>

                    <ArrowOutwardRoundedIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", minHeight: 318 }}>
            <Stack spacing={1} sx={{ p: 2.2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Ultimas entregas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {latestDeliveries.length} pedido(s) no total
                </Typography>
              </Box>

              <Stack>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <Stack
                        key={`loading-${index}`}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          py: 1.25,
                          borderTop: 1,
                          borderColor: "divider",
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Chip label="#" size="small" sx={{ minWidth: 44, fontWeight: 700 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                              <Skeleton variant="text" width={130} />
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              <Skeleton variant="text" width={160} />
                            </Typography>
                          </Box>
                        </Stack>
                        <Skeleton variant="rounded" width={88} height={28} />
                      </Stack>
                    ))
                  : latestDeliveries.map((delivery, index) => (
                      <Stack
                        key={`delivery-${delivery.id}`}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          py: 1.25,
                          borderTop: 1,
                          borderColor: "divider",
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Chip label={`#${latestDeliveries.length - index}`} size="small" sx={{ minWidth: 44, fontWeight: 700 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                              {delivery.clientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {`${delivery.deliverymanName} · ${currencyFormatter.format(delivery.amount)}`}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip label={statusLabel[delivery.status]} color={statusColor[delivery.status]} size="small" variant="filled" />
                      </Stack>
                    ))}

                {!loading && latestDeliveries.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Nenhuma entrega encontrada para o seu escopo.
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {(loading ? Array.from({ length: 4 }) : footerCards).map((_, index) => (
          <Grid key={`footer-card-${index}`} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
                <Stack spacing={0.25}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {loading ? <Skeleton variant="text" width={40} /> : footerCards[index].value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {loading ? <Skeleton variant="text" width={90} /> : footerCards[index].label}
                  </Typography>
                </Stack>
                <Box sx={{ color: "text.secondary", display: "grid", placeItems: "center" }}>
                  {loading ? <Skeleton variant="circular" width={20} height={20} /> : footerCards[index].icon}
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default DashboardIndex;
