import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "../../services/api";
import { getRealtimeSocket } from "../../services/realtime";
import NovoPedidoDrawer from "./NovoPedidoDrawer";

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

interface PreloadedClientData {
  name: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    neighborhood: string;
    numberHouse: string;
    reference: string;
    city: string;
  };
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  actived: { label: "Aguardando aceite", color: "#F59E0B" },
  delivered: { label: "Em Trânsito", color: "#0EA5E9" },
  finished: { label: "Entregue", color: "#10B981" },
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

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const getInitials = (name: string, lastName: string) => `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const ListagemEntregas: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deliverymanFilter, setDeliverymanFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [preloadedClient, setPreloadedClient] = useState<{
    clientId?: number;
    clientData?: PreloadedClientData;
  } | null>(null);

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
    const state = location.state as { openCreate?: boolean; clientData?: { id?: number; clientData?: PreloadedClientData } } | null;

    if (state?.openCreate) {
      setPreloadedClient({
        clientId: state.clientData?.id,
        clientData: state.clientData?.clientData,
      });
      setCreateOpen(true);
    }
    // Executa apenas na entrada da rota; o state de navegação não deve reabrir o drawer em re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const term = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? order.status === "actived" || order.status === "delivered"
          : order.status === "finished");

      const matchesDeliveryman =
        deliverymanFilter === "all" || String(order.deliveryman?.id ?? "") === deliverymanFilter;

      const matchesCity = cityFilter === "all" || order.Register.address.city === cityFilter;

      const matchesNeighborhood =
        neighborhoodFilter === "all" || order.Register.address.neighborhood === neighborhoodFilter;

      const matchesSearch =
        !term ||
        `${order.Register.client.name} ${order.Register.client.lastName}`.toLowerCase().includes(term) ||
        order.Register.address.street.toLowerCase().includes(term) ||
        String(order.id).includes(term);

      return matchesStatus && matchesDeliveryman && matchesCity && matchesNeighborhood && matchesSearch;
    });
  }, [orders, statusFilter, deliverymanFilter, cityFilter, neighborhoodFilter, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, deliverymanFilter, cityFilter, neighborhoodFilter, searchTerm]);

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

  const activeCount = useMemo(
    () => orders.filter((order) => order.status !== "finished").length,
    [orders],
  );

  const statusChips: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "all", label: "Todos", count: orders.length },
    { value: "active", label: "Ativos", count: activeCount },
    { value: "finished", label: "Finalizados", count: orders.length - activeCount },
  ];

  const handleCloseDrawer = () => {
    setCreateOpen(false);
    setPreloadedClient(null);
    fetchOrders();
  };

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pedidos de Entrega
            </Typography>
            <Chip
              label={loading ? "..." : orders.length}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, "& .MuiChip-label": { px: 1.1 } }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Gerencie e acompanhe todos os pedidos ativos e finalizados
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 999, px: 2.5, whiteSpace: "nowrap" }}
        >
          Novo Pedido
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", p: 2.25 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              Total de pedidos
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {loading ? <CircularProgress size={22} /> : orders.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              considerando todos os status
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", p: 2.25 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              Pedidos em andamento
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#F59E0B" }}>
              {loading ? <CircularProgress size={22} /> : activeCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              aguardando ou em trânsito
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              size="small"
              placeholder="Buscar por ID, cliente ou endereço..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack direction="row" spacing={1}>
              {statusChips.map((chip) => (
                <Chip
                  key={chip.value}
                  label={`${chip.label} (${loading ? "…" : chip.count})`}
                  onClick={() => setStatusFilter(chip.value)}
                  color={statusFilter === chip.value ? "primary" : "default"}
                  variant={statusFilter === chip.value ? "filled" : "outlined"}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Stack>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="Entregador"
                value={deliverymanFilter}
                onChange={(event) => setDeliverymanFilter(event.target.value)}
              >
                <MenuItem value="all">Todos os entregadores</MenuItem>
                {deliverymen.map((deliveryman) => (
                  <MenuItem key={deliveryman.id} value={String(deliveryman.id)}>
                    {deliveryman.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="Cidade"
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="Bairro"
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

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Destino e bairro</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Entregador</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Valor</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Recebido em</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">
                        Ações
                      </TableCell>
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
                        const status = statusConfig[order.status];

                        return (
                          <TableRow key={order.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                                {order.Register.client.name} {order.Register.client.lastName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {order.Register.address.street}, {order.Register.address.numberHouse}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {order.Register.address.neighborhood} - {order.Register.address.city}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {order.deliveryman ? (
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "secondary.main" }}>
                                    {getInitials(order.deliveryman.name, order.deliveryman.lastName)}
                                  </Avatar>
                                  <Typography variant="body2" noWrap>
                                    {order.deliveryman.name} {order.deliveryman.lastName}
                                  </Typography>
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.disabled">
                                  Não atribuído
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{currencyFormatter.format(Number(order.amount))}</TableCell>
                            <TableCell>{formatDateTime(order.receivedAt ?? order.data)}</TableCell>
                            <TableCell>
                              <Chip
                                label={status.label}
                                size="small"
                                sx={{ bgcolor: alpha(status.color, 0.14), color: status.color, fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {order.status !== "finished" ? (
                                <Tooltip title="Finalizar entrega">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() =>
                                      navigate("/finalizar-entrega", { state: { orderId: order.id } })
                                    }
                                  >
                                    <CheckCircleOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : null}
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
                labelDisplayedRows={({ from, to, count }) => `Mostrando ${from} a ${to} de ${count} pedidos`}
              />
            </>
          )}
        </Stack>
      </Card>

      <NovoPedidoDrawer
        open={createOpen}
        onClose={handleCloseDrawer}
        preloadedClientId={preloadedClient?.clientId}
        preloadedClientData={preloadedClient?.clientData}
      />
    </Stack>
  );
};

export default ListagemEntregas;
