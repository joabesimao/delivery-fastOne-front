import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../services/api";
import { getRealtimeSocket } from "../../services/realtime";

type OrderStatus = "actived" | "delivered" | "finished";
type StatusFilter = "all" | "active" | "finished";

interface OrderData {
  id: number;
  quantity: string;
  amount: number;
  data: string;
  receivedAt?: string;
  finishedAt?: string;
  status: OrderStatus;
  deliveryman?: {
    id: number;
    name: string;
    lastName: string;
  };
  Register: {
    client: {
      name: string;
      lastName: string;
    };
    address: {
      street: string;
      numberHouse: number;
      neighborhood: string;
      city: string;
    };
  };
}

const statusLabel: Record<OrderStatus, string> = {
  actived: "Ativo",
  delivered: "Em entrega",
  finished: "Finalizado",
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ListagemEntregas: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deliverymanFilter, setDeliverymanFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);

    api
      .get<OrderData[]>("/orderDelivery")
      .then((response) => {
        setOrders(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setError("Erro ao carregar as entregas.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket) {
      return;
    }

    const onDeliveryChanged = () => {
      fetchOrders();
    };

    socket.on("delivery:changed", onDeliveryChanged);

    return () => {
      socket.off("delivery:changed", onDeliveryChanged);
    };
  }, []);

  const deliverymen = useMemo(() => {
    const map = new Map<number, string>();

    orders.forEach((order) => {
      if (order.deliveryman?.id) {
        map.set(order.deliveryman.id, `${order.deliveryman.name} ${order.deliveryman.lastName}`.trim());
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  const cities = useMemo(() => {
    const unique = new Set<string>();

    orders.forEach((order) => {
      if (order.Register?.address?.city) {
        unique.add(order.Register.address.city);
      }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const neighborhoods = useMemo(() => {
    const unique = new Set<string>();

    orders
      .filter((order) => cityFilter === "all" || order.Register.address.city === cityFilter)
      .forEach((order) => {
        if (order.Register?.address?.neighborhood) {
          unique.add(order.Register.address.neighborhood);
        }
      });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [orders, cityFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? order.status === "actived" || order.status === "delivered"
          : order.status === "finished");

      const matchesDeliveryman =
        deliverymanFilter === "all" || String(order.deliveryman?.id ?? "") === deliverymanFilter;

      const matchesCity =
        cityFilter === "all" || order.Register.address.city === cityFilter;

      const matchesNeighborhood =
        neighborhoodFilter === "all" || order.Register.address.neighborhood === neighborhoodFilter;

      return matchesStatus && matchesDeliveryman && matchesCity && matchesNeighborhood;
    });
  }, [
    orders,
    statusFilter,
    deliverymanFilter,
    cityFilter,
    neighborhoodFilter,
  ]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, deliverymanFilter, cityFilter, neighborhoodFilter]);

  useEffect(() => {
    if (cityFilter === "all") {
      return;
    }

    if (!neighborhoods.includes(neighborhoodFilter)) {
      setNeighborhoodFilter("all");
    }
  }, [cityFilter, neighborhoods, neighborhoodFilter]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Listagem de entregas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Acompanhe entregas ativas e finalizadas com filtros por entregador, cidade e bairro.
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={2} sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
              Status
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativos</MenuItem>
                <MenuItem value="finished">Finalizados</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
              Entregador
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={deliverymanFilter}
                onChange={(event) => setDeliverymanFilter(event.target.value)}
              >
                <MenuItem value="all">Todos os entregadores</MenuItem>
                {deliverymen.map((deliveryman) => (
                  <MenuItem key={deliveryman.id} value={String(deliveryman.id)}>
                    {deliveryman.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
              Cidade
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
            >
              <MenuItem value="all">Todas as cidades</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
              Bairro
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={neighborhoodFilter}
              onChange={(event) => setNeighborhoodFilter(event.target.value)}
            >
              <MenuItem value="all">Todos os bairros</MenuItem>
              {neighborhoods.map((neighborhood) => (
                <MenuItem key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : null}

        {error ? (
          <Box sx={{ p: 2.5 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : null}

        {!loading && !error ? (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Endereço</TableCell>
                    <TableCell>Entregador</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Recebido em</TableCell>
                    <TableCell>Finalizado em</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        Nenhuma entrega encontrada para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((order) => {
                      const receivedAt = order.receivedAt ?? order.data;
                      const finishedAt = order.finishedAt;

                      return (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            {order.Register.client.name} {order.Register.client.lastName}
                          </TableCell>
                          <TableCell>
                            {order.Register.address.street}, {order.Register.address.numberHouse}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {order.Register.address.neighborhood} - {order.Register.address.city}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {order.deliveryman
                              ? `${order.deliveryman.name} ${order.deliveryman.lastName}`
                              : "Nao vinculado"}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            {Number(order.amount).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell>{formatDateTime(receivedAt)}</TableCell>
                          <TableCell>{formatDateTime(finishedAt)}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={statusLabel[order.status]}
                              color={order.status === "finished" ? "success" : "warning"}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Linhas por página"
            />
          </>
        ) : null}
      </Paper>
    </Box>
  );
};

export default ListagemEntregas;
