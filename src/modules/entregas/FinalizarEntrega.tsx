import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Formik, Form } from "formik";
import api from "../../services/api";
import { phoneMask } from "../../helpers/masks";
import { getRealtimeSocket } from "../../services/realtime";

type OrderStatus = "actived" | "delivered" | "finished";

const statusLabel: Record<OrderStatus, string> = {
  actived: "Ativo",
  delivered: "Em entrega",
  finished: "Finalizado",
};

const statusColor: Record<OrderStatus, { bg: string; darkBg: string; text: string; darkText: string; border: string }> = {
  actived: { bg: "#E8ECFF", darkBg: "rgba(67,97,238,0.15)", text: "#4361EE", darkText: "#818cf8", border: "#C7D2FE" },
  delivered: { bg: "#FFF7E6", darkBg: "rgba(217,119,6,0.15)", text: "#D97706", darkText: "#fbbf24", border: "#FDE68A" },
  finished: { bg: "#ECFDF5", darkBg: "rgba(5,150,105,0.15)", text: "#059669", darkText: "#34d399", border: "#A7F3D0" },
};

interface OrderData {
  id: number;
  quantity: string;
  amount: number;
  data: string;
  status: OrderStatus;
  deliveryman?: {
    id: number;
    name: string;
    lastName: string;
    phone: string;
  };
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

interface FinalizeFormValues {
  quantity: string;
  amount: number | "";
  deliverymanId: string;
}

interface DeliverymanFilterOption {
  id: number;
  name: string;
  lastName: string;
}

const FinalizarEntrega: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardBg = isDark ? "#111827" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const inputBg = isDark ? "#1f2937" : "#f9fafb";
  const rowHover = isDark ? "#1e2a3a" : "#f0f7ff";

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [deliverymanFilter, setDeliverymanFilter] = useState<string>("all");
  const [deliverymen, setDeliverymen] = useState<DeliverymanFilterOption[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    api
      .get<OrderData[]>("/orderDelivery")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar a lista de pedidos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

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

  useEffect(() => {
    api
      .get<DeliverymanFilterOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          `${o.Register.client.name} ${o.Register.client.lastName}`.toLowerCase().includes(term) ||
          String(o.id).includes(term) ||
          o.Register.address.city.toLowerCase().includes(term) ||
          o.Register.address.neighborhood.toLowerCase().includes(term) ||
          `${o.deliveryman?.name ?? ""} ${o.deliveryman?.lastName ?? ""}`
            .toLowerCase()
            .includes(term);
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        const matchesDeliveryman =
          deliverymanFilter === "all" ||
          String(o.deliveryman?.id ?? "") === deliverymanFilter;
        return matchesSearch && matchesStatus && matchesDeliveryman;
      });
  }, [orders, search, statusFilter, deliverymanFilter]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => { setPage(0); }, [search, statusFilter, deliverymanFilter]);

  const handleFinalize = async (
    values: FinalizeFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!selectedOrder) return;
    try {
      await api.put(`/orderDelivery/${selectedOrder.id}`, {
        quantity: values.quantity,
        amount: Number(values.amount),
        deliverymanId: Number(values.deliverymanId),
        status: "finished",
      });
      setSnackbar({ open: true, message: "Entrega finalizada com sucesso!", severity: "success" });
      setSelectedOrder(null);
      resetForm();
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: "Erro ao finalizar a entrega. Tente novamente.", severity: "error" });
    }
  };

  // ── Painel de finalização ──────────────────────────────────────────────
  if (selectedOrder) {
    const o = selectedOrder;
    const sc = statusColor[o.status];
    return (
      <>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            maxWidth: 800,
            mx: "auto",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <IconButton size="small" onClick={() => setSelectedOrder(null)}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
              Finalizar entrega
            </Typography>
            <Box sx={{ width: 32 }} />
          </Box>
          <Divider sx={{ mb: 4 }} />

          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
            Dados do pedido
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Chip
                label={`Pedido #${o.id}`}
                size="small"
                sx={{ bgcolor: "#E8ECFF", color: "#4361EE", fontWeight: 700, border: "1px solid #C7D2FE" }}
              />
              <Chip
                label={statusLabel[o.status]}
                size="small"
                sx={{
                  bgcolor: isDark ? sc.darkBg : sc.bg,
                  color: isDark ? sc.darkText : sc.text,
                  fontWeight: 600,
                  border: `1px solid ${sc.border}`,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {new Date(o.data).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={600}
                    sx={{ color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    Cliente
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: "text.primary" }}>
                    {o.Register.client.name} {o.Register.client.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {phoneMask(o.Register.client.phone)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={600}
                    sx={{ color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    Entregador
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: "text.primary" }}>
                    {o.deliveryman
                      ? `${o.deliveryman.name} ${o.deliveryman.lastName}`
                      : "Não vinculado"}
                  </Typography>
                  {o.deliveryman?.phone ? (
                    <Typography variant="body2" color="text.secondary">
                      {phoneMask(o.deliveryman.phone)}
                    </Typography>
                  ) : null}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={600}
                    sx={{ color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    Endereço
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: "text.primary" }}>
                    {o.Register.address.street}, {o.Register.address.numberHouse}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {o.Register.address.neighborhood} — {o.Register.address.city}
                  </Typography>
                  {o.Register.address.reference && (
                    <Typography variant="caption" color="text.secondary">
                      Ref: {o.Register.address.reference}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
            Confirmar dados da entrega
          </Typography>

          <Formik
            initialValues={{
              quantity: o.quantity,
              amount: o.amount,
              deliverymanId: o.deliveryman ? String(o.deliveryman.id) : "",
            }}
            validate={(values) => {
              const errors: Partial<FinalizeFormValues> = {};
              if (!values.quantity.trim() || Number(values.quantity) <= 0)
                errors.quantity = "Informe a quantidade.";
              if (!values.amount || Number(values.amount) <= 0)
                errors.amount = "Informe o valor." as unknown as number;
              if (!values.deliverymanId)
                errors.deliverymanId = "Selecione o entregador.";
              return errors;
            }}
            onSubmit={handleFinalize}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form noValidate>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12 }}>
                    <FieldLabel label="Entregador responsável *" />
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name="deliverymanId"
                      value={values.deliverymanId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.deliverymanId && errors.deliverymanId)}
                      helperText={touched.deliverymanId && errors.deliverymanId}
                    >
                      <MenuItem value="" disabled>
                        <em>Selecione o entregador</em>
                      </MenuItem>
                      {deliverymen.map((deliveryman) => (
                        <MenuItem key={deliveryman.id} value={String(deliveryman.id)}>
                          {deliveryman.name} {deliveryman.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel label="Quantidade *" />
                    <TextField
                      fullWidth size="small" placeholder="Ex: 3"
                      type="number"
                      slotProps={{ htmlInput: { min: 1 } }}
                      name="quantity" value={values.quantity}
                      onChange={handleChange} onBlur={handleBlur}
                      error={Boolean(touched.quantity && errors.quantity)}
                      helperText={touched.quantity && errors.quantity}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel label="Valor final *" />
                    <TextField
                      fullWidth size="small" placeholder="0,00"
                      type="number"
                      slotProps={{
                        htmlInput: { min: 0, step: 0.01 },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" color="text.secondary">R$</Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                      name="amount" value={values.amount}
                      onChange={handleChange} onBlur={handleBlur}
                      error={Boolean(touched.amount && errors.amount)}
                      helperText={touched.amount && errors.amount}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    variant="outlined" color="inherit" disabled={isSubmitting}
                    sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary" }}
                    onClick={() => setSelectedOrder(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit" variant="contained" disabled={isSubmitting}
                    sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" } }}
                    startIcon={
                      isSubmitting
                        ? <CircularProgress size={16} color="inherit" />
                        : <CheckCircleOutlineIcon fontSize="small" />
                    }
                  >
                    {isSubmitting ? "Finalizando..." : "Finalizar entrega"}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>

        <Snackbar
          open={snackbar.open} autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} variant="filled"
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // ── Listagem ───────────────────────────────────────────────────────────
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700} sx={{ color: textPrimary }}>
          Finalizar entrega
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: "hidden" }}
      >
        {/* Título do card */}
        <Box px={3} py={2.5} sx={{ borderBottom: `1px solid ${borderColor}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>
            Pedidos de entrega
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary, mt: 0.5 }}>
            Clique em uma linha aberta ou em entrega para finalizar o pedido.
          </Typography>
        </Box>

        {/* Filtros */}
        <Box
          display="flex" flexWrap="wrap" gap={2} px={3} py={2.5}
          sx={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <Box flex="1" minWidth={220}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Buscar pedido
            </Typography>
            <TextField
              size="small"
              placeholder="Nome do cliente, entregador, ID, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: labelColor }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch("")}>
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: inputBg, fontSize: 13 },
              }}
            />
          </Box>

          <Box flex="1" minWidth={180}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Status do pedido
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: inputBg, fontSize: 13 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="actived">Ativo</MenuItem>
                <MenuItem value="delivered">Em entrega</MenuItem>
                <MenuItem value="finished">Finalizado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box flex="1" minWidth={220}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Entregador
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={deliverymanFilter}
                onChange={(e) => setDeliverymanFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: inputBg, fontSize: 13 }}
              >
                <MenuItem value="all">Todos os entregadores</MenuItem>
                {deliverymen.map((deliveryman) => (
                  <MenuItem key={deliveryman.id} value={String(deliveryman.id)}>
                    {deliveryman.name} {deliveryman.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#4361EE" }} />
          </Box>
        )}

        {error && (
          <Box px={3} py={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? "#1f2937" : "#f9fafb" }}>
                    {["ID", "Cliente", "Entregador", "Endereço", "Bairro / Cidade", "Qtd.", "Valor", "Data", "Status"].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          color: labelColor,
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: 0.3,
                          py: 1.5,
                          borderColor,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{ py: 6, color: textSecondary, fontSize: 14, borderColor }}
                      >
                        {search || statusFilter !== "all"
                          ? "Nenhum pedido encontrado para os filtros aplicados."
                          : "Nenhum pedido encontrado no momento."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((o) => {
                      const sc = statusColor[o.status];
                      const canFinalize = o.status !== "finished";
                      return (
                        <TableRow
                          key={o.id}
                          hover
                          onClick={() => canFinalize && setSelectedOrder(o)}
                          sx={{
                            cursor: canFinalize ? "pointer" : "default",
                            "&:hover": { bgcolor: canFinalize ? rowHover : "inherit" },
                            "& td": { borderColor, fontSize: 13, py: 1.2 },
                            opacity: canFinalize ? 1 : 0.9,
                          }}
                        >
                          <TableCell sx={{ color: textSecondary, fontWeight: 600 }}>#{o.id}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: 13, color: textPrimary }}>
                                {o.Register.client.name} {o.Register.client.lastName}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: textSecondary }}>
                                {phoneMask(o.Register.client.phone)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {o.deliveryman
                              ? `${o.deliveryman.name} ${o.deliveryman.lastName}`
                              : "Não vinculado"}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {o.Register.address.street}, {o.Register.address.numberHouse}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {o.Register.address.neighborhood} — {o.Register.address.city}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {o.quantity}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151", whiteSpace: "nowrap" }}>
                            {Number(o.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell sx={{ color: textSecondary, whiteSpace: "nowrap" }}>
                            {new Date(o.data).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusLabel[o.status]}
                              size="small"
                              sx={{
                                bgcolor: isDark ? sc.darkBg : sc.bg,
                                color: isDark ? sc.darkText : sc.text,
                                fontWeight: 600,
                                fontSize: 11,
                                height: 22,
                                border: `1px solid ${sc.border}`,
                              }}
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
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              sx={{ borderTop: `1px solid ${borderColor}`, color: textSecondary, fontSize: 13 }}
            />
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const FieldLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "text.secondary" }}>
    {label}
  </Typography>
);

export default FinalizarEntrega;
