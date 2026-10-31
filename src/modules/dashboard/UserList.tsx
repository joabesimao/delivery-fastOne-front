import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
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
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "@/shared/api/httpClient";
import {
  ROLE_OPTIONS,
  UserFormDialog,
  type User as UserItem,
  type UserRole,
} from "@/features/users";

const DEBOUNCE_MS = 400;

const ROLE_FILTER_OPTIONS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "Todos os papéis" },
  ...ROLE_OPTIONS,
];

const ROLE_META: Record<UserRole, { label: string; color: "error" | "warning" | "info" | "default" }> = {
  admin: { label: "Administrador", color: "error" },
  gerente_estoque: { label: "Gerente de Estoque", color: "warning" },
  entregador: { label: "Entregador", color: "info" },
  user: { label: "Usuário", color: "default" },
};

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.q = search;
      if (roleFilter !== "all") params.role = roleFilter;

      const res = await api.get<UserItem[]>("/account", { params });
      setUsers(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch {
      setError("Erro ao carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, page, rowsPerPage]);

  const hasActiveFilters = Boolean(searchInput || roleFilter !== "all");

  const openCreateForm = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEditForm = (user: UserItem) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleSaved = () => {
    closeForm();
    void loadUsers();
  };

  const handleToggleActive = async (user: UserItem) => {
    try {
      setActionLoadingId(user.id);
      await api.put(`/account/${user.id}`, { active: !user.active });
      await loadUsers();
      showSnackbar(
        user.active ? "Usuário desativado com sucesso." : "Usuário ativado com sucesso.",
        "success",
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Não foi possível alterar o status do usuário.";
      showSnackbar(message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoadingId(deleteTarget.id);
      await api.delete(`/account/${deleteTarget.id}`);
      setDeleteTarget(null);
      if (paginated.length === 1 && page > 0) {
        setPage((p) => p - 1);
      }
      await loadUsers();
      showSnackbar("Usuário excluído com sucesso.", "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      const message =
        err?.response?.data?.error || err?.response?.data?.message || "Erro ao excluir usuário. Tente novamente.";
      showSnackbar(message, "error");
    } finally {
      setActionLoadingId(null);
    }
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os usuários do sistema, seus papéis e permissões de acesso.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={openCreateForm}
          sx={{ borderRadius: 999, whiteSpace: "nowrap" }}
        >
          Novo usuário
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              size="small"
              placeholder="Buscar por nome ou e-mail..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
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
            <TextField
              select
              size="small"
              label="Papel"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}
              sx={{ minWidth: 200 }}
            >
              {ROLE_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {hasActiveFilters ? (
              <Button
                size="small"
                onClick={() => {
                  setSearchInput("");
                  setRoleFilter("all");
                }}
                sx={{ alignSelf: "center", fontWeight: 700 }}
              >
                Limpar filtros
              </Button>
            ) : null}
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : paginated.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              {hasActiveFilters ? "Nenhum usuário encontrado para os filtros aplicados." : "Nenhum usuário cadastrado."}
            </Typography>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>E-mail</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Papel</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((user) => {
                    const isBusy = actionLoadingId === user.id;
                    const roleMeta = ROLE_META[user.role] ?? ROLE_META.user;

                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                            {user.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={roleMeta.label} size="small" color={roleMeta.color} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.active ? "Ativo" : "Inativo"}
                            size="small"
                            color={user.active ? "success" : "default"}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEditForm(user)} disabled={isBusy}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.active ? "Desativar" : "Ativar"}>
                            <IconButton size="small" onClick={() => void handleToggleActive(user)} disabled={isBusy}>
                              {isBusy ? (
                                <CircularProgress size={16} />
                              ) : (
                                <PowerSettingsNewRoundedIcon
                                  fontSize="small"
                                  color={user.active ? "success" : "disabled"}
                                />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => setDeleteTarget(user)} disabled={isBusy}>
                              <DeleteRoundedIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && paginated.length > 0 ? (
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) => `Mostrando ${from} a ${to} de ${count} usuários`}
            />
          ) : null}
        </Stack>
      </Card>

      <UserFormDialog open={formOpen} onClose={closeForm} onSaved={handleSaved} user={editingUser} />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Excluir usuário</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário <strong>{deleteTarget?.name}</strong>? Essa ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            disabled={Boolean(deleteTarget && actionLoadingId === deleteTarget.id)}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default UserList;
