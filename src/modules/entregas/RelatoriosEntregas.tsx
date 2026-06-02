import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import api from "@/services/api";

type OrderStatus = "actived" | "delivered" | "finished";

interface OrderData {
  id: number;
  quantity: string;
  amount: number;
  data: string;
  status: OrderStatus;
  Register: {
    client: { name: string; lastName: string; phone: string };
    address: {
      street: string;
      neighborhood: string;
      numberHouse: number;
      reference: string;
      city: string;
    };
  };
}

const statusLabel: Record<OrderStatus, string> = {
  actived: "Ativo",
  delivered: "Em entrega",
  finished: "Finalizado",
};

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  actived: { bg: "#E7EEFF", text: "#4361EE" },
  delivered: { bg: "#FFF5E6", text: "#D97706" },
  finished: { bg: "#ECFDF5", text: "#059669" },
};

const RelatoriosEntregas: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<OrderData[]>("/orderDelivery")
      .then((response) => setOrders(Array.isArray(response.data) ? response.data : []))
      .catch(() => setError("Não foi possível carregar os relatórios de entregas."))
      .finally(() => setLoading(false));
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [orders],
  );

  const summary = useMemo(() => {
    const total = orders.length;
    const finished = orders.filter((order) => order.status === "finished").length;
    const active = orders.filter((order) => order.status === "actived").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const revenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    return { total, finished, active, delivered, revenue };
  }, [orders]);

  const cardSx = {
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    boxShadow: isDark ? "none" : "0 12px 30px rgba(46, 70, 116, 0.08)",
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary" }}>
          Relatórios das entregas
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
          Visão geral das entregas, status e movimentação recente.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.2} sx={{ mb: 3 }}>
        {[
          { label: "Total de pedidos", value: summary.total, icon: <LocalShippingIcon />, color: "#4361EE" },
          { label: "Finalizados", value: summary.finished, icon: <CheckCircleIcon />, color: "#059669" },
          { label: "Em entrega", value: summary.delivered, icon: <AccessTimeIcon />, color: "#D97706" },
          { label: "Ativos", value: summary.active, icon: <HourglassEmptyIcon />, color: "#7C3AED" },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.75 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary" }}>
                    {loading ? "--" : item.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: `${item.color}14`,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ ...cardSx, p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Resumo financeiro
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Soma total dos valores registrados nas entregas.
            </Typography>

            <Box
              sx={{
                borderRadius: 4,
                p: 3,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background:
                  "linear-gradient(135deg, rgba(67,97,238,0.12), rgba(14,165,233,0.08))",
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: "text.secondary" }}>
                  Receita total
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ mt: 1 }}>
                  {loading ? "--" : `R$ ${summary.revenue.toFixed(2)}`}
                </Typography>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                Essa página será sua visão principal após o login. Aqui você acompanha o volume de pedidos,
                os status mais recentes e o valor movimentado pelas entregas.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ ...cardSx, p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Últimas entregas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Histórico recente dos pedidos.
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Pedido</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cidade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedOrders.slice(0, 8).map((order) => {
                      const status = statusColors[order.status];
                      return (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              #{order.id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(order.data).toLocaleString("pt-BR")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {order.Register.client.name} {order.Register.client.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.Register.client.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{order.Register.address.city}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.Register.address.neighborhood}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={statusLabel[order.status]}
                              sx={{
                                bgcolor: status.bg,
                                color: status.text,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!sortedOrders.length && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                            Nenhuma entrega encontrada.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RelatoriosEntregas;
