import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
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
  useTheme,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { isValidPhone, phoneMask, stripPhone } from "../../helpers/masks";

interface DeliverymanItem {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  numberQualification: string;
}

interface EditDeliverymanForm {
  name: string;
  lastName: string;
  phone: string;
  numberQualification: string;
}

const ListaEntregadores: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [entregadores, setEntregadores] = useState<DeliverymanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [viewDeliveryman, setViewDeliveryman] = useState<DeliverymanItem | null>(null);
  const [editDeliveryman, setEditDeliveryman] = useState<DeliverymanItem | null>(null);
  const [editValues, setEditValues] = useState<EditDeliverymanForm | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Filtros
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadDeliverymen = async () => {
    try {
      setLoading(true);
      const res = await api.get<DeliverymanItem[]>("/deliveryman");
      setEntregadores(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch {
      setError("Erro ao carregar a lista de entregadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDeliverymen();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const openEditDialog = (deliveryman: DeliverymanItem) => {
    setEditDeliveryman(deliveryman);
    setEditValues({
      name: deliveryman.name,
      lastName: deliveryman.lastName,
      phone: phoneMask(deliveryman.phone),
      numberQualification: deliveryman.numberQualification,
    });
  };

  const handleSaveEdit = async () => {
    if (!editDeliveryman || !editValues) return;

    if (
      !editValues.name.trim() ||
      !editValues.lastName.trim() ||
      !editValues.phone.trim() ||
      !editValues.numberQualification.trim()
    ) {
      showSnackbar("Todos os campos são obrigatórios.", "error");
      return;
    }

    if (!isValidPhone(editValues.phone)) {
      showSnackbar("Telefone inválido. Use DDD + número.", "error");
      return;
    }

    try {
      setActionLoadingId(editDeliveryman.id);
      await api.put(`/deliveryman/${editDeliveryman.id}`, {
        name: editValues.name,
        lastName: editValues.lastName,
        phone: stripPhone(editValues.phone),
        numberQualification: editValues.numberQualification,
      });

      setEditDeliveryman(null);
      setEditValues(null);
      await loadDeliverymen();
      showSnackbar("Entregador atualizado com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao atualizar entregador. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDeliveryman = async (id: number) => {
    try {
      setActionLoadingId(id);
      await api.delete(`/deliveryman/${id}`);
      setDeleteConfirmId(null);
      await loadDeliverymen();
      showSnackbar("Entregador deletado com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao deletar entregador. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = useMemo(() => {
    return entregadores.filter((d) => {
      const nameTerm = search.trim().toLowerCase();
      const phoneTerm = phoneSearch.trim().toLowerCase();

      const matchesName =
        !nameTerm ||
        `${d.name} ${d.lastName}`.toLowerCase().includes(nameTerm);

      const matchesPhone =
        !phoneTerm || stripPhone(d.phone).includes(stripPhone(phoneTerm));

      return matchesName && matchesPhone;
    });
  }, [entregadores, search, phoneSearch]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPage(0);
  }, [search, phoneSearch]);

  // Tokens de cor
  const cardBg = isDark ? "#111827" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const inputBg = isDark ? "#1f2937" : "#f9fafb";
  const rowHover = isDark ? "#1e2a3a" : "#f0f7ff";

  return (
    <Box>
      {/* Cabeçalho da página */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" fontWeight={700} sx={{ color: textPrimary }}>
          Gerenciar entregadores
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate("/cadastros/entregador")}
          sx={{
            bgcolor: "#0ea5e9",
            "&:hover": { bgcolor: "#0284c7" },
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Cadastrar entregador
        </Button>
      </Box>

      {/* Card principal */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 1,
          border: `5px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: "hidden",
        }}
      >
        {/* Título do card */}
        <Box
          display="flex"
          px={5}
          py={2.5}
          sx={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>
            Listagem de entregadores
          </Typography>
        </Box>

        {/* Linha de filtros */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          px={3}
          py={2.5}
          sx={{ borderBottom: `1px solid ${borderColor}` }}
        >
          {/* Busca por nome */}
          <Box flex="1" minWidth={200}>
            <Typography
              variant="caption"
              sx={{
                color: labelColor,
                fontWeight: 600,
                mb: 0.5,
                display: "block",
              }}
            >
              Buscar entregador
            </Typography>
            <TextField
              size="small"
              placeholder="Digite o nome do entregador"
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
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: inputBg,
                  fontSize: 13,
                },
              }}
            />
          </Box>

          {/* Busca por telefone */}
          <Box flex="1" minWidth={180}>
            <Typography
              variant="caption"
              sx={{
                color: labelColor,
                fontWeight: 600,
                mb: 0.5,
                display: "block",
              }}
            >
              Buscar por telefone
            </Typography>
            <TextField
              size="small"
              placeholder="Digite o telefone"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: labelColor }} />
                    </InputAdornment>
                  ),
                  endAdornment: phoneSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setPhoneSearch("")}
                      >
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: inputBg,
                  fontSize: 13,
                },
              }}
            />
          </Box>
        </Box>

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#0ea5e9" }} />
          </Box>
        )}

        {/* Erro */}
        {error && (
          <Box px={3} py={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Tabela */}
        {!loading && !error && (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? "#1f2937" : "#f9fafb" }}>
                    {[
                      "Nome do entregador",
                      "ID",
                      "Telefone",
                      "Habilitação",
                      "Ações",
                    ].map((col) => (
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
                        colSpan={5}
                        align="center"
                        sx={{
                          py: 6,
                          color: textSecondary,
                          fontSize: 14,
                          borderColor,
                        }}
                      >
                        {search || phoneSearch
                          ? "Nenhum entregador encontrado para os filtros aplicados."
                          : "Nenhum entregador cadastrado."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((d) => {
                      const isBusy = actionLoadingId === d.id;
                      return (
                        <TableRow
                          key={d.id}
                          hover
                          sx={{
                            "&:hover": { bgcolor: rowHover },
                            "& td": { borderColor, fontSize: 13, py: 1.2 },
                          }}
                        >
                          {/* Nome + Sobrenome */}
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: textPrimary,
                              }}
                            >
                              {d.name} {d.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: textSecondary }}>
                            {d.id}
                          </TableCell>
                          <TableCell
                            sx={{ color: isDark ? "#d1d5db" : "#374151" }}
                          >
                            {phoneMask(d.phone)}
                          </TableCell>
                          <TableCell
                            sx={{ color: isDark ? "#d1d5db" : "#374151" }}
                          >
                            {d.numberQualification}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="Visualizar">
                                <IconButton
                                  size="small"
                                  onClick={() => setViewDeliveryman(d)}
                                  disabled={isBusy}
                                  sx={{
                                    bgcolor: isDark ? "#374151" : "#e5e7eb",
                                    borderRadius: 1.5,
                                    "&:hover": {
                                      bgcolor: isDark ? "#4b5563" : "#d1d5db",
                                    },
                                  }}
                                >
                                  <VisibilityIcon
                                    sx={{
                                      fontSize: 16,
                                      color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(d)}
                                  disabled={isBusy}
                                  sx={{
                                    bgcolor: "#f59e0b",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: "#d97706" },
                                  }}
                                >
                                  <EditIcon
                                    sx={{ fontSize: 16, color: "#fff" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Deletar">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteConfirmId(d.id)}
                                  disabled={isBusy}
                                  sx={{
                                    bgcolor: "#ef4444",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: "#dc2626" },
                                  }}
                                >
                                  <DeleteIcon
                                    sx={{ fontSize: 16, color: "#fff" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mais opções">
                                <IconButton
                                  size="small"
                                  sx={{
                                    bgcolor: isDark ? "#374151" : "#e5e7eb",
                                    borderRadius: 1.5,
                                    "&:hover": {
                                      bgcolor: isDark ? "#4b5563" : "#d1d5db",
                                    },
                                  }}
                                >
                                  <MoreHorizIcon
                                    sx={{
                                      fontSize: 16,
                                      color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Rodapé com total + paginação */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={3}
              sx={{ borderTop: `1px solid ${borderColor}` }}
            >
              <Typography sx={{ fontSize: 13, color: textSecondary }}>
                Total: {filtered.length} registro
                {filtered.length !== 1 ? "s" : ""}
              </Typography>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_: unknown, newPage: number) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Linhas por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count}`
                }
                sx={{
                  "& .MuiTablePagination-toolbar": { minHeight: 48 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    { fontSize: 12, color: textSecondary },
                  color: textSecondary,
                }}
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Dialog Visualizar */}
      <Dialog
        open={Boolean(viewDeliveryman)}
        onClose={() => setViewDeliveryman(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Detalhes do entregador</DialogTitle>
        <DialogContent dividers>
          {viewDeliveryman && (
            <Box display="grid" gap={1.25}>
              <Typography variant="body2">
                <strong>Nome:</strong> {viewDeliveryman.name} {viewDeliveryman.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Telefone:</strong> {phoneMask(viewDeliveryman.phone)}
              </Typography>
              <Typography variant="body2">
                <strong>Habilitação:</strong> {viewDeliveryman.numberQualification}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDeliveryman(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog
        open={Boolean(editDeliveryman && editValues)}
        onClose={() => {
          setEditDeliveryman(null);
          setEditValues(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar entregador</DialogTitle>
        <DialogContent dividers>
          {editValues && (
            <Box display="grid" gap={1.5} pt={0.5}>
              <TextField
                label="Nome"
                size="small"
                value={editValues.name}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
              />
              <TextField
                label="Sobrenome"
                size="small"
                value={editValues.lastName}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, lastName: e.target.value } : prev,
                  )
                }
              />
              <TextField
                label="Telefone"
                size="small"
                value={editValues.phone}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, phone: phoneMask(e.target.value) } : prev,
                  )
                }
                inputProps={{ maxLength: 15, inputMode: "numeric" }}
              />
              <TextField
                label="Habilitação"
                size="small"
                value={editValues.numberQualification}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? { ...prev, numberQualification: e.target.value.replace(/\D/g, "") }
                      : prev,
                  )
                }
                inputProps={{ maxLength: 12, inputMode: "numeric" }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDeliveryman(null);
              setEditValues(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              void handleSaveEdit();
            }}
            variant="contained"
            disabled={actionLoadingId === editDeliveryman?.id}
          >
            {actionLoadingId === editDeliveryman?.id ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Deleção */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar este entregador? Esta ação é irreversível.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteConfirmId) {
                void handleDeleteDeliveryman(deleteConfirmId);
              }
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

      {/* Snackbar */}
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

export default ListaEntregadores;
