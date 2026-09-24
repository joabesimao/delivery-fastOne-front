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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../services/api";
import { extractApiErrorMessage } from "../../../helpers/extractApiErrorMessage";

interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
}

interface VeiculoItem {
  id: number;
  plate: string;
  model: string;
  brand?: string | null;
  deliverymanId?: number | null;
}

interface ListaVeiculosProps {
  refreshKey?: number;
}

const ListaVeiculos: React.FC<ListaVeiculosProps> = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [veiculos, setVeiculos] = useState<VeiculoItem[]>([]);
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [editVeiculo, setEditVeiculo] = useState<VeiculoItem | null>(null);
  const [editValues, setEditValues] = useState({ plate: "", model: "", brand: "", deliverymanId: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const deliverymanName = (id?: number | null) => {
    if (!id) return "—";
    const d = deliverymen.find((dm) => dm.id === id);
    return d ? `${d.name} ${d.lastName}` : "—";
  };

  const loadVeiculos = () => {
    setLoading(true);
    api
      .get<VeiculoItem[]>("/vehicle")
      .then((res) => setVeiculos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar a lista de veículos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api
      .get<DeliverymanOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
  }, []);

  useEffect(() => {
    loadVeiculos();
  }, [refreshKey]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveEdit = async () => {
    if (!editVeiculo || !editValues.plate.trim() || !editValues.model.trim()) return;

    try {
      setActionLoadingId(editVeiculo.id);
      await api.put(`/vehicle/${editVeiculo.id}`, {
        plate: editValues.plate.trim().toUpperCase(),
        model: editValues.model.trim(),
        brand: editValues.brand.trim() || undefined,
        deliverymanId: editValues.deliverymanId ? Number(editValues.deliverymanId) : undefined,
      });
      setEditVeiculo(null);
      loadVeiculos();
      showSnackbar("Veículo atualizado com sucesso.", "success");
    } catch (err) {
      showSnackbar(extractApiErrorMessage(err, "Erro ao atualizar veículo. Tente novamente."), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoadingId(id);
      await api.delete(`/vehicle/${id}`);
      setDeleteConfirmId(null);
      loadVeiculos();
      showSnackbar("Veículo deletado com sucesso.", "success");
    } catch (err) {
      showSnackbar(extractApiErrorMessage(err, "Erro ao deletar veículo. Tente novamente."), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <DirectionsCarIcon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: isDark ? "#E2E4EC" : "#003459" }}>
          Veículos cadastrados
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
            overflow: "hidden",
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
                {["#", "Placa", "Modelo", "Marca", "Entregador", "Ações"].map((col) => (
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
              {veiculos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 5, color: isDark ? "#7C7F8E" : "#94a3b8", fontSize: 14 }}
                  >
                    Nenhum veículo cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((v, idx) => (
                  <TableRow
                    key={v.id}
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
                        label={v.id}
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
                      {v.plate}
                    </TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>{v.brand || "—"}</TableCell>
                    <TableCell>{deliverymanName(v.deliverymanId)}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            disabled={actionLoadingId === v.id}
                            onClick={() => {
                              setEditVeiculo(v);
                              setEditValues({
                                plate: v.plate,
                                model: v.model,
                                brand: v.brand || "",
                                deliverymanId: v.deliverymanId ? String(v.deliverymanId) : "",
                              });
                            }}
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
                            disabled={actionLoadingId === v.id}
                            onClick={() => setDeleteConfirmId(v.id)}
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(editVeiculo)}
        onClose={() => setEditVeiculo(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Editar veículo</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Placa"
            size="small"
            fullWidth
            value={editValues.plate}
            onChange={(e) => setEditValues((v) => ({ ...v, plate: e.target.value }))}
            sx={{ mt: 0.5 }}
          />
          <TextField
            label="Modelo"
            size="small"
            fullWidth
            value={editValues.model}
            onChange={(e) => setEditValues((v) => ({ ...v, model: e.target.value }))}
          />
          <TextField
            label="Marca"
            size="small"
            fullWidth
            value={editValues.brand}
            onChange={(e) => setEditValues((v) => ({ ...v, brand: e.target.value }))}
          />
          <TextField
            select
            label="Entregador"
            size="small"
            fullWidth
            value={editValues.deliverymanId}
            onChange={(e) => setEditValues((v) => ({ ...v, deliverymanId: e.target.value }))}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {deliverymen.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.name} {d.lastName}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditVeiculo(null)}>Cancelar</Button>
          <Button
            onClick={() => void handleSaveEdit()}
            variant="contained"
            disabled={!editValues.plate.trim() || !editValues.model.trim() || actionLoadingId === editVeiculo?.id}
          >
            {actionLoadingId === editVeiculo?.id ? (
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
            Tem certeza que deseja deletar este veículo? Registros de troca de óleo e abastecimento vinculados a ele impedem a exclusão.
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

export default ListaVeiculos;
