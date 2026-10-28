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
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/shared/api/httpClient";
import DataTableHead from "@/shared/ui/data-table/DataTableHead";

interface CityItem {
  id: number;
  name: string;
}

interface CityListProps {
  refreshKey?: number;
}

const CityList: React.FC<CityListProps> = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [editCity, setEditCity] = useState<CityItem | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadCities = () => {
    setLoading(true);
    api
      .get<CityItem[]>("/city")
      .then((res) => setCities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar a lista de cidades."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCities();
  }, [refreshKey]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveEdit = async () => {
    if (!editCity || !editName.trim()) return;

    try {
      setActionLoadingId(editCity.id);
      await api.put(`/city/${editCity.id}`, { name: editName.trim() });
      setEditCity(null);
      setEditName("");
      loadCities();
      showSnackbar("Cidade atualizada com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao atualizar cidade. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoadingId(id);
      await api.delete(`/city/${id}`);
      setDeleteConfirmId(null);
      loadCities();
      showSnackbar("Cidade deletada com sucesso.", "success");
    } catch {
      showSnackbar(
        "Erro ao deletar cidade. Verifique se não há bairros vinculados a ela.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <LocationCityIcon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: isDark ? "#E2E4EC" : "#003459" }}>
          Cidades cadastradas
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
            <DataTableHead columns={["#", "Nome", "Ações"]} />
            <TableBody>
              {cities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ py: 5, color: isDark ? "#7C7F8E" : "#94a3b8", fontSize: 14 }}
                  >
                    Nenhuma cidade cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((c, idx) => (
                  <TableRow
                    key={c.id}
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
                        label={c.id}
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
                      {c.name}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            disabled={actionLoadingId === c.id}
                            onClick={() => {
                              setEditCity(c);
                              setEditName(c.name);
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
                            disabled={actionLoadingId === c.id}
                            onClick={() => setDeleteConfirmId(c.id)}
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
        open={Boolean(editCity)}
        onClose={() => {
          setEditCity(null);
          setEditName("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Editar cidade</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Nome"
            size="small"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditCity(null);
              setEditName("");
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSaveEdit()}
            variant="contained"
            disabled={!editName.trim() || actionLoadingId === editCity?.id}
          >
            {actionLoadingId === editCity?.id ? (
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
            Tem certeza que deseja deletar esta cidade? Bairros vinculados a ela impedem a exclusão.
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

export default CityList;
