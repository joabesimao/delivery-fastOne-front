import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../services/api";
import { extractApiErrorMessage } from "../../../helpers/extractApiErrorMessage";
import { computeTotalValue } from "./computeTotalValue";

interface VehicleOption {
  id: number;
  plate: string;
  model: string;
}

interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
}

interface FuelRefillItem {
  id: number;
  vehicleId: number;
  deliverymanId: number;
  km: number;
  previousKm: number | null;
  kmDriven: number | null;
  liters: number;
  pricePerLiter: number | null;
  totalValue: number;
  refillDate: string;
  vehicle?: { plate: string; model: string } | null;
  deliveryman?: { name: string; lastName: string } | null;
}

interface EditValues {
  vehicleId: string;
  deliverymanId: string;
  km: string;
  liters: string;
  pricePerLiter: string;
  totalValue: string;
  refillDate: string;
}

interface ListaAbastecimentoProps {
  refreshKey?: number;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PRICE_PER_LITER_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const MANAGER_ROLES = ["admin", "gerente_estoque"];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const EMPTY_EDIT_VALUES: EditValues = {
  vehicleId: "",
  deliverymanId: "",
  km: "",
  liters: "",
  pricePerLiter: "",
  totalValue: "",
  refillDate: "",
};

const isEditValid = (values: EditValues) =>
  Boolean(values.vehicleId && values.deliverymanId && values.refillDate) &&
  [values.km, values.liters, values.pricePerLiter, values.totalValue].every((v) => Number(v) > 0);

const ListaAbastecimento: React.FC<ListaAbastecimentoProps> = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const canManage = MANAGER_ROLES.includes(localStorage.getItem("currentUserRole") ?? "");

  const [refills, setRefills] = useState<FuelRefillItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [editRefill, setEditRefill] = useState<FuelRefillItem | null>(null);
  const [editValues, setEditValues] = useState<EditValues>(EMPTY_EDIT_VALUES);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const vehicleLabel = (item: FuelRefillItem) => {
    if (item.vehicle) return `${item.vehicle.plate} — ${item.vehicle.model}`;
    const v = vehicles.find((veh) => veh.id === item.vehicleId);
    return v ? `${v.plate} — ${v.model}` : "—";
  };

  const deliverymanLabel = (item: FuelRefillItem) => {
    if (item.deliveryman) return `${item.deliveryman.name} ${item.deliveryman.lastName}`;
    const d = deliverymen.find((dm) => dm.id === item.deliverymanId);
    return d ? `${d.name} ${d.lastName}` : "—";
  };

  const consumption = (item: FuelRefillItem) => {
    if (item.kmDriven === null || item.kmDriven === undefined || !item.liters) return "—";
    return `${(item.kmDriven / item.liters).toFixed(2)} km/l`;
  };

  useEffect(() => {
    api
      .get<VehicleOption[]>("/vehicle")
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicles([]));
    api
      .get<DeliverymanOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
  }, []);

  const loadRefills = () => {
    setLoading(true);
    api
      .get<FuelRefillItem[]>("/fuel-refill")
      .then((res) => setRefills(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar o histórico de abastecimentos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRefills();
  }, [refreshKey]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const openEdit = (refill: FuelRefillItem) => {
    setEditRefill(refill);
    setEditValues({
      vehicleId: String(refill.vehicleId),
      deliverymanId: String(refill.deliverymanId),
      km: String(refill.km),
      liters: String(refill.liters),
      pricePerLiter: refill.pricePerLiter === null ? "" : String(refill.pricePerLiter),
      totalValue: String(refill.totalValue),
      refillDate: refill.refillDate.slice(0, 10),
    });
  };

  const handleSaveEdit = async () => {
    if (!editRefill || !isEditValid(editValues)) return;

    try {
      setActionLoadingId(editRefill.id);
      await api.put(`/fuel-refill/${editRefill.id}`, {
        vehicleId: Number(editValues.vehicleId),
        deliverymanId: Number(editValues.deliverymanId),
        km: Number(editValues.km),
        liters: Number(editValues.liters),
        pricePerLiter: Number(editValues.pricePerLiter),
        totalValue: Number(editValues.totalValue),
        refillDate: new Date(editValues.refillDate).toISOString(),
      });
      setEditRefill(null);
      loadRefills();
      showSnackbar("Abastecimento atualizado com sucesso.", "success");
    } catch (err) {
      showSnackbar(extractApiErrorMessage(err, "Erro ao atualizar abastecimento. Tente novamente."), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoadingId(id);
      await api.delete(`/fuel-refill/${id}`);
      setDeleteConfirmId(null);
      loadRefills();
      showSnackbar("Abastecimento deletado com sucesso.", "success");
    } catch (err) {
      showSnackbar(extractApiErrorMessage(err, "Erro ao deletar abastecimento. Tente novamente."), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    "#", "Veículo", "Entregador", "Km atual", "Km rodado", "Litros", "Preço/L", "Valor", "Consumo", "Data",
    ...(canManage ? ["Ações"] : []),
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <LocalGasStationIcon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: isDark ? "#E2E4EC" : "#003459" }}>
          Histórico de abastecimentos
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress sx={{ color: isDark ? "#7C9CBF" : "#003459" }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,52,89,0.10)",
            border: isDark ? "none" : "1px solid #e2e8f0",
            overflowX: "auto",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: isDark
                    ? "#003459"
                    : "linear-gradient(90deg, #003459 0%, #005588 100%)",
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      color: "#e7dbdb",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      letterSpacing: 0.4,
                      borderBottom: "none",
                      py: 1.5,
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {refills.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 5, color: isDark ? "#7C7F8E" : "#94a3b8", fontSize: 14 }}
                  >
                    Nenhum abastecimento lançado.
                  </TableCell>
                </TableRow>
              ) : (
                refills.map((refill, idx) => (
                  <TableRow
                    key={refill.id}
                    hover
                    sx={{
                      backgroundColor: isDark
                        ? idx % 2 === 0 ? "#0e0f0f" : "#0f0e0e"
                        : idx % 2 === 0 ? "#ffffff" : "#f8fafd",
                      transition: "background-color 0.15s",
                      "&:hover": { backgroundColor: isDark ? "#1a2535" : "#eef4fb" },
                      "& td": {
                        borderColor: isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0",
                        color: isDark ? "#C8CAD4" : "#374151",
                        fontSize: 13,
                        py: 1.2,
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={refill.id}
                        size="small"
                        sx={{
                          backgroundColor: isDark ? "#003459" : "#dbeafe",
                          color: isDark ? "#fff" : "#1e40af",
                          fontWeight: 700,
                          fontSize: 11,
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: isDark ? "#E2E4EC !important" : "#111827 !important" }}>
                      {vehicleLabel(refill)}
                    </TableCell>
                    <TableCell>{deliverymanLabel(refill)}</TableCell>
                    <TableCell>{refill.km.toLocaleString("pt-BR")} km</TableCell>
                    <TableCell>
                      {refill.kmDriven === null || refill.kmDriven === undefined
                        ? "—"
                        : `${refill.kmDriven.toLocaleString("pt-BR")} km`}
                    </TableCell>
                    <TableCell>{Number(refill.liters).toFixed(2)} L</TableCell>
                    <TableCell>
                      {refill.pricePerLiter === null || refill.pricePerLiter === undefined
                        ? "—"
                        : PRICE_PER_LITER_FORMATTER.format(Number(refill.pricePerLiter))}
                    </TableCell>
                    <TableCell>{CURRENCY_FORMATTER.format(Number(refill.totalValue))}</TableCell>
                    <TableCell>{consumption(refill)}</TableCell>
                    <TableCell>{formatDate(refill.refillDate)}</TableCell>
                    {canManage && (
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              disabled={actionLoadingId === refill.id}
                              onClick={() => openEdit(refill)}
                              sx={{
                                bgcolor: "#f59e0b",
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: "#d97706" },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16, color: "#fff" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deletar">
                            <IconButton
                              size="small"
                              disabled={actionLoadingId === refill.id}
                              onClick={() => setDeleteConfirmId(refill.id)}
                              sx={{
                                bgcolor: "#ef4444",
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: "#dc2626" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16, color: "#fff" }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(editRefill)} onClose={() => setEditRefill(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar abastecimento</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Veículo"
            size="small"
            fullWidth
            value={editValues.vehicleId}
            onChange={(e) => setEditValues((v) => ({ ...v, vehicleId: e.target.value }))}
            sx={{ mt: 0.5 }}
          >
            {vehicles.map((v) => (
              <MenuItem key={v.id} value={String(v.id)}>
                {v.plate} — {v.model}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Entregador"
            size="small"
            fullWidth
            value={editValues.deliverymanId}
            onChange={(e) => setEditValues((v) => ({ ...v, deliverymanId: e.target.value }))}
          >
            {deliverymen.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.name} {d.lastName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Km no abastecimento"
            size="small"
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={editValues.km}
            onChange={(e) => setEditValues((v) => ({ ...v, km: e.target.value }))}
          />
          <TextField
            label="Data do abastecimento"
            size="small"
            fullWidth
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={editValues.refillDate}
            onChange={(e) => setEditValues((v) => ({ ...v, refillDate: e.target.value }))}
          />
          <TextField
            label="Litros abastecidos"
            size="small"
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            value={editValues.liters}
            onChange={(e) =>
              setEditValues((v) => ({
                ...v,
                liters: e.target.value,
                totalValue: computeTotalValue(e.target.value, v.pricePerLiter),
              }))
            }
          />
          <TextField
            label="Preço do litro (R$)"
            size="small"
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: "0.001" } }}
            value={editValues.pricePerLiter}
            onChange={(e) =>
              setEditValues((v) => ({
                ...v,
                pricePerLiter: e.target.value,
                totalValue: computeTotalValue(v.liters, e.target.value),
              }))
            }
          />
          <TextField
            label="Valor pago (R$)"
            size="small"
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            helperText="Calculado por litros × preço; pode ajustar."
            value={editValues.totalValue}
            onChange={(e) => setEditValues((v) => ({ ...v, totalValue: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRefill(null)}>Cancelar</Button>
          <Button
            onClick={() => void handleSaveEdit()}
            variant="contained"
            disabled={!isEditValid(editValues) || actionLoadingId === editRefill?.id}
          >
            {actionLoadingId === editRefill?.id ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} maxWidth="xs">
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar este abastecimento? O km rodado e o consumo do abastecimento seguinte serão recalculados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteConfirmId) void handleDelete(deleteConfirmId);
            }}
            variant="contained"
            color="error"
            disabled={actionLoadingId === deleteConfirmId}
          >
            {actionLoadingId === deleteConfirmId ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Deletar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListaAbastecimento;
