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
import BuildIcon from "@mui/icons-material/Build";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../services/api";
import { extractApiErrorMessage } from "../../../helpers/extractApiErrorMessage";

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

interface OilChangeLogItem {
  id: number;
  vehicleId: number;
  deliverymanId: number;
  km: number;
  nextChangeKm: number;
  changeDate: string;
  vehicle?: { plate: string; model: string } | null;
  deliveryman?: { name: string; lastName: string } | null;
}

interface EditValues {
  vehicleId: string;
  deliverymanId: string;
  km: string;
  changeDate: string;
}

interface ListaTrocaOleoProps {
  refreshKey?: number;
}

const MANAGER_ROLES = ["admin", "gerente_estoque"];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const EMPTY_EDIT_VALUES: EditValues = { vehicleId: "", deliverymanId: "", km: "", changeDate: "" };

const isEditValid = (values: EditValues) =>
  Boolean(values.vehicleId && values.deliverymanId && values.changeDate) && Number(values.km) > 0;

const ListaTrocaOleo: React.FC<ListaTrocaOleoProps> = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const canManage = MANAGER_ROLES.includes(localStorage.getItem("currentUserRole") ?? "");

  const [logs, setLogs] = useState<OilChangeLogItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [editLog, setEditLog] = useState<OilChangeLogItem | null>(null);
  const [editValues, setEditValues] = useState<EditValues>(EMPTY_EDIT_VALUES);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const vehicleLabel = (item: OilChangeLogItem) => {
    if (item.vehicle) return `${item.vehicle.plate} — ${item.vehicle.model}`;
    const v = vehicles.find((veh) => veh.id === item.vehicleId);
    return v ? `${v.plate} — ${v.model}` : "—";
  };

  const deliverymanLabel = (item: OilChangeLogItem) => {
    if (item.deliveryman) return `${item.deliveryman.name} ${item.deliveryman.lastName}`;
    const d = deliverymen.find((dm) => dm.id === item.deliverymanId);
    return d ? `${d.name} ${d.lastName}` : "—";
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

  const loadLogs = () => {
    setLoading(true);
    api
      .get<OilChangeLogItem[]>("/oil-change-log")
      .then((res) => setLogs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar o histórico de trocas de óleo."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [refreshKey]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const openEdit = (log: OilChangeLogItem) => {
    setEditLog(log);
    setEditValues({
      vehicleId: String(log.vehicleId),
      deliverymanId: String(log.deliverymanId),
      km: String(log.km),
      changeDate: log.changeDate.slice(0, 10),
    });
  };

  const handleSaveEdit = async () => {
    if (!editLog || !isEditValid(editValues)) return;

    try {
      setActionLoadingId(editLog.id);
      await api.put(`/oil-change-log/${editLog.id}`, {
        vehicleId: Number(editValues.vehicleId),
        deliverymanId: Number(editValues.deliverymanId),
        km: Number(editValues.km),
        changeDate: new Date(editValues.changeDate).toISOString(),
      });
      setEditLog(null);
      loadLogs();
      showSnackbar("Troca de óleo atualizada com sucesso.", "success");
    } catch (err) {
      showSnackbar(extractApiErrorMessage(err, "Erro ao atualizar troca de óleo. Tente novamente."), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoadingId(id);
      await api.delete(`/oil-change-log/${id}`);
      setDeleteConfirmId(null);
      loadLogs();
      showSnackbar("Troca de óleo deletada com sucesso.", "success");
    } catch (err) {
      showSnackbar(extractApiErrorMessage(err, "Erro ao deletar troca de óleo. Tente novamente."), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    "#", "Veículo", "Entregador", "Km lançado", "Km próxima troca", "Data",
    ...(canManage ? ["Ações"] : []),
  ];

  const previewNextChangeKm =
    editLog && Number(editValues.km) > 0 ? Number(editValues.km) + (editLog.nextChangeKm - editLog.km) : null;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <BuildIcon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: isDark ? "#E2E4EC" : "#003459" }}>
          Histórico de trocas de óleo
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
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 5, color: isDark ? "#7C7F8E" : "#94a3b8", fontSize: 14 }}
                  >
                    Nenhuma troca de óleo lançada.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, idx) => (
                  <TableRow
                    key={log.id}
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
                        label={log.id}
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
                      {vehicleLabel(log)}
                    </TableCell>
                    <TableCell>{deliverymanLabel(log)}</TableCell>
                    <TableCell>{log.km.toLocaleString("pt-BR")} km</TableCell>
                    <TableCell>{log.nextChangeKm.toLocaleString("pt-BR")} km</TableCell>
                    <TableCell>{formatDate(log.changeDate)}</TableCell>
                    {canManage && (
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              disabled={actionLoadingId === log.id}
                              onClick={() => openEdit(log)}
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
                              disabled={actionLoadingId === log.id}
                              onClick={() => setDeleteConfirmId(log.id)}
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

      <Dialog open={Boolean(editLog)} onClose={() => setEditLog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar troca de óleo</DialogTitle>
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
            label="Km da troca"
            size="small"
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={editValues.km}
            onChange={(e) => setEditValues((v) => ({ ...v, km: e.target.value }))}
            helperText={
              previewNextChangeKm !== null
                ? `Próxima troca: ${previewNextChangeKm.toLocaleString("pt-BR")} km`
                : undefined
            }
          />
          <TextField
            label="Data da troca"
            size="small"
            fullWidth
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={editValues.changeDate}
            onChange={(e) => setEditValues((v) => ({ ...v, changeDate: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditLog(null)}>Cancelar</Button>
          <Button
            onClick={() => void handleSaveEdit()}
            variant="contained"
            disabled={!isEditValid(editValues) || actionLoadingId === editLog?.id}
          >
            {actionLoadingId === editLog?.id ? (
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
          <Typography>Tem certeza que deseja deletar esta troca de óleo?</Typography>
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

export default ListaTrocaOleo;
