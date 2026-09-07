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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../services/api";

interface BairroItem {
  id: number;
  name: string;
  cityId: number;
  city?: { name: string };
}

interface CityOption {
  id: number;
  name: string;
}

interface ListaBairrosProps {
  refreshKey?: number;
}

const ListaBairros: React.FC<ListaBairrosProps> = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [bairros, setBairros] = useState<BairroItem[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [editBairro, setEditBairro] = useState<BairroItem | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; cityId: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadBairros = () => {
    setLoading(true);
    api
      .get<BairroItem[]>("/neighborhood")
      .then((res) => setBairros(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar a lista de bairros."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBairros();
  }, [refreshKey]);

  useEffect(() => {
    api
      .get<CityOption[]>("/city")
      .then((res) => setCities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCities([]));
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveEdit = async () => {
    if (!editBairro || !editValues || !editValues.name.trim() || !editValues.cityId) return;

    try {
      setActionLoadingId(editBairro.id);
      await api.put(`/neighborhood/${editBairro.id}`, {
        name: editValues.name.trim(),
        cityId: Number(editValues.cityId),
      });
      setEditBairro(null);
      setEditValues(null);
      loadBairros();
      showSnackbar("Bairro atualizado com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao atualizar bairro. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoadingId(id);
      await api.delete(`/neighborhood/${id}`);
      setDeleteConfirmId(null);
      loadBairros();
      showSnackbar("Bairro deletado com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao deletar bairro. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <LocationOnIcon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: isDark ? "#E2E4EC" : "#003459" }}>
          Bairros cadastrados
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
                {["#", "Bairro", "Cidade", "Ações"].map((col) => (
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
              {bairros.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 5, color: isDark ? "#7C7F8E" : "#94a3b8", fontSize: 14 }}
                  >
                    Nenhum bairro cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                bairros.map((b, idx) => (
                  <TableRow
                    key={b.id}
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
                        label={b.id}
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
                      {b.name}
                    </TableCell>
                    <TableCell>{b.city?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            disabled={actionLoadingId === b.id}
                            onClick={() => {
                              setEditBairro(b);
                              setEditValues({ name: b.name, cityId: String(b.cityId) });
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
                            disabled={actionLoadingId === b.id}
                            onClick={() => setDeleteConfirmId(b.id)}
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

      {/* Dialog Editar */}
      <Dialog
        open={Boolean(editBairro && editValues)}
        onClose={() => {
          setEditBairro(null);
          setEditValues(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Editar bairro</DialogTitle>
        <DialogContent dividers>
          {editValues && (
            <Box display="grid" gap={1.5} pt={0.5}>
              <TextField
                label="Nome"
                size="small"
                fullWidth
                value={editValues.name}
                onChange={(e) =>
                  setEditValues((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                }
              />
              <TextField
                select
                label="Cidade"
                size="small"
                fullWidth
                value={editValues.cityId}
                onChange={(e) =>
                  setEditValues((prev) => (prev ? { ...prev, cityId: e.target.value } : prev))
                }
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditBairro(null);
              setEditValues(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSaveEdit()}
            variant="contained"
            disabled={
              !editValues?.name.trim() || !editValues?.cityId || actionLoadingId === editBairro?.id
            }
          >
            {actionLoadingId === editBairro?.id ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Deleção */}
      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} maxWidth="xs">
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja deletar este bairro? Esta ação é irreversível.</Typography>
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

export default ListaBairros;
