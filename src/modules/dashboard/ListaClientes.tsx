import React, { useEffect, useState, useMemo } from "react";
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
  FormControl,
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
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { isValidPhone, phoneMask, stripPhone } from "../../helpers/masks";

interface Address {
  id?: number;
  street: string;
  neighborhood: string;
  numberHouse: number;
  reference: string;
  city: string;
}

interface ClientItem {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  status?: boolean;
  Register?: {
    id?: number;
    addressId?: number;
    address: Address;
  };
}

interface EditClientForm {
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

const ListaClientes: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [viewClient, setViewClient] = useState<ClientItem | null>(null);
  const [editClient, setEditClient] = useState<ClientItem | null>(null);
  const [editValues, setEditValues] = useState<EditClientForm | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Filtros
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await api.get<ClientItem[] | null>("/client");
      setClientes(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch {
      setError("Erro ao carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const openEditDialog = (client: ClientItem) => {
    const address = client.Register?.address;
    setEditClient(client);
    setEditValues({
      name: client.name,
      lastName: client.lastName,
      phone: phoneMask(client.phone),
      address: {
        street: address?.street ?? "",
        neighborhood: address?.neighborhood ?? "",
        numberHouse: address?.numberHouse ? String(address.numberHouse) : "",
        reference: address?.reference ?? "",
        city: address?.city ?? "",
      },
    });
  };

  const handleToggleStatus = async (client: ClientItem) => {
    const nextStatus = !(client.status !== false);
    try {
      setActionLoadingId(client.id);
      await api.put(`/client/${client.id}`, { status: nextStatus });
      await loadClients();
      showSnackbar(
        nextStatus
          ? "Cliente ativado com sucesso."
          : "Cliente inativado com sucesso.",
        "success",
      );
    } catch {
      showSnackbar("Não foi possível alterar o status do cliente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editClient || !editValues) return;

    if (
      !editValues.name.trim() ||
      !editValues.lastName.trim() ||
      !editValues.phone.trim()
    ) {
      showSnackbar("Nome, sobrenome e telefone são obrigatórios.", "error");
      return;
    }

    if (!isValidPhone(editValues.phone)) {
      showSnackbar("Telefone inválido. Use DDD + número.", "error");
      return;
    }

    if (
      !editValues.address.street.trim() ||
      !editValues.address.neighborhood.trim() ||
      !editValues.address.city.trim() ||
      !editValues.address.numberHouse.trim()
    ) {
      showSnackbar("Preencha os campos obrigatórios do endereço.", "error");
      return;
    }

    const addressId =
      editClient.Register?.addressId ?? editClient.Register?.address?.id;
    if (!addressId) {
      showSnackbar(
        "Não foi possível identificar o endereço do cliente para edição.",
        "error",
      );
      return;
    }

    try {
      setActionLoadingId(editClient.id);
      await api.put(`/client/${editClient.id}`, {
        name: editValues.name,
        lastName: editValues.lastName,
        phone: stripPhone(editValues.phone),
      });

      await api.put(`/address/${addressId}`, {
        street: editValues.address.street,
        neighborhood: editValues.address.neighborhood,
        city: editValues.address.city,
        numberHouse: Number(editValues.address.numberHouse),
        reference: editValues.address.reference,
      });

      setEditClient(null);
      setEditValues(null);
      await loadClients();
      showSnackbar("Cliente atualizado com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao atualizar cliente. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cidades únicas para o filtro
  const cities = useMemo(() => {
    const set = new Set<string>();
    clientes.forEach((c) => {
      const city = c.Register?.address?.city;
      if (city) set.add(city);
    });
    return Array.from(set).sort();
  }, [clientes]);

  const filtered = useMemo(() => {
    return clientes.filter((c) => {
      const addr = c.Register?.address;
      const nameTerm = search.trim().toLowerCase();
      const phoneTerm = phoneSearch.trim().toLowerCase();

      const matchesName =
        !nameTerm ||
        `${c.name} ${c.lastName}`.toLowerCase().includes(nameTerm) ||
        addr?.neighborhood?.toLowerCase().includes(nameTerm) ||
        addr?.street?.toLowerCase().includes(nameTerm);

      const matchesPhone =
        !phoneTerm || stripPhone(c.phone).includes(stripPhone(phoneTerm));

      const matchesCity = cityFilter === "all" || addr?.city === cityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "ativo" ? c.status !== false : c.status === false);

      return matchesName && matchesPhone && matchesCity && matchesStatus;
    });
  }, [clientes, search, phoneSearch, cityFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPage(0);
  }, [search, phoneSearch, cityFilter, statusFilter]);

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
          Visualizar clientes cadastrados
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Importar dados
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/cadastros/cliente")}
            sx={{
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Cadastrar cliente
          </Button>
        </Box>
      </Box>

      {/* Card principal */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 1,
          border: `5px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: "hidden",
          mr: 40,
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
            Listagem de clientes
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
              Buscar cliente
            </Typography>
            <TextField
              size="small"
              placeholder="Digite o nome do cliente"
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

          {/* Filtro cidade */}
          <Box flex="1" minWidth={160}>
            <Typography
              variant="caption"
              sx={{
                color: labelColor,
                fontWeight: 600,
                mb: 0.5,
                display: "block",
              }}
            >
              Cidades
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value as string)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: inputBg, fontSize: 13 }}
              >
                <MenuItem value="all">Filtrar por cidade</MenuItem>
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtro status */}
          <Box flex="1" minWidth={160}>
            <Typography
              variant="caption"
              sx={{
                color: labelColor,
                fontWeight: 600,
                mb: 0.5,
                display: "block",
              }}
            >
              Status do Cliente
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: inputBg, fontSize: 13 }}
              >
                <MenuItem value="all">Filtrar por status...</MenuItem>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
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
                      "Nome do cliente",
                      "ID",
                      "Telefone do cliente",
                      "Bairro",
                      "Cidade",
                      "Status",
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
                        colSpan={7}
                        align="center"
                        sx={{
                          py: 6,
                          color: textSecondary,
                          fontSize: 14,
                          borderColor,
                        }}
                      >
                        {search ||
                        phoneSearch ||
                        cityFilter !== "all" ||
                        statusFilter !== "all"
                          ? "Nenhum cliente encontrado para os filtros aplicados."
                          : "Nenhum cliente cadastrado."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((c) => {
                      const addr = c.Register?.address;
                      const isActive = c.status !== false;
                      const isBusy = actionLoadingId === c.id;
                      return (
                        <TableRow
                          key={c.id}
                          hover
                          sx={{
                            "&:hover": { bgcolor: rowHover },
                            "& td": { borderColor, fontSize: 13, py: 1.2 },
                          }}
                        >
                          {/* Nome + endereço secundário */}
                          <TableCell>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 13,
                                  color: textPrimary,
                                }}
                              >
                                {c.name} {c.lastName}
                              </Typography>
                              {addr?.street && (
                                <Typography
                                  sx={{ fontSize: 11, color: textSecondary }}
                                >
                                  {addr.street}
                                  {addr.numberHouse
                                    ? `, ${addr.numberHouse}`
                                    : ""}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: textSecondary }}>
                            {c.id}
                          </TableCell>
                          <TableCell
                            sx={{ color: isDark ? "#d1d5db" : "#374151" }}
                          >
                            {c.phone}
                          </TableCell>
                          <TableCell
                            sx={{ color: isDark ? "#d1d5db" : "#374151" }}
                          >
                            {addr?.neighborhood ?? "—"}
                          </TableCell>
                          <TableCell
                            sx={{ color: isDark ? "#d1d5db" : "#374151" }}
                          >
                            {addr?.city ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isActive ? "Ativo" : "Inativo"}
                              size="small"
                              sx={{
                                bgcolor: isActive
                                  ? isDark
                                    ? "rgba(52,211,153,0.15)"
                                    : "#d1fae5"
                                  : isDark
                                    ? "rgba(239,68,68,0.2)"
                                    : "#fee2e2",
                                color: isActive
                                  ? isDark
                                    ? "#34d399"
                                    : "#065f46"
                                  : isDark
                                    ? "#fca5a5"
                                    : "#991b1b",
                                fontWeight: 600,
                                fontSize: 11,
                                height: 22,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="Visualizar">
                                <IconButton
                                  size="small"
                                  onClick={() => setViewClient(c)}
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
                                  onClick={() => openEditDialog(c)}
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
                              <Tooltip title={isActive ? "Inativar" : "Ativar"}>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    void handleToggleStatus(c);
                                  }}
                                  disabled={isBusy}
                                  sx={{
                                    bgcolor: isActive ? "#ef4444" : "#22c55e",
                                    borderRadius: 1.5,
                                    "&:hover": {
                                      bgcolor: isActive ? "#dc2626" : "#16a34a",
                                    },
                                  }}
                                >
                                  {isBusy ? (
                                    <CircularProgress
                                      size={14}
                                      sx={{ color: "#fff" }}
                                    />
                                  ) : (
                                    <PowerSettingsNewIcon
                                      sx={{ fontSize: 16, color: "#fff" }}
                                    />
                                  )}
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

      <Dialog
        open={Boolean(viewClient)}
        onClose={() => setViewClient(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Detalhes do cliente</DialogTitle>
        <DialogContent dividers>
          {viewClient && (
            <Box display="grid" gap={1.25}>
              <Typography variant="body2">
                <strong>Nome:</strong> {viewClient.name} {viewClient.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Telefone:</strong> {phoneMask(viewClient.phone)}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{" "}
                {viewClient.status !== false ? "Ativo" : "Inativo"}
              </Typography>
              <Typography variant="body2">
                <strong>Rua:</strong>{" "}
                {viewClient.Register?.address?.street ?? "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Número:</strong>{" "}
                {viewClient.Register?.address?.numberHouse ?? "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Bairro:</strong>{" "}
                {viewClient.Register?.address?.neighborhood ?? "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Cidade:</strong>{" "}
                {viewClient.Register?.address?.city ?? "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Referência:</strong>{" "}
                {viewClient.Register?.address?.reference || "—"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewClient(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editClient && editValues)}
        onClose={() => {
          setEditClient(null);
          setEditValues(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar cliente</DialogTitle>
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
                label="Rua"
                size="small"
                value={editValues.address.street}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          address: { ...prev.address, street: e.target.value },
                        }
                      : prev,
                  )
                }
              />
              <TextField
                label="Bairro"
                size="small"
                value={editValues.address.neighborhood}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          address: {
                            ...prev.address,
                            neighborhood: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
              <TextField
                label="Cidade"
                size="small"
                value={editValues.address.city}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }
                      : prev,
                  )
                }
              />
              <TextField
                label="Número"
                size="small"
                value={editValues.address.numberHouse}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          address: {
                            ...prev.address,
                            numberHouse: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
              <TextField
                label="Referência"
                size="small"
                value={editValues.address.reference}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          address: {
                            ...prev.address,
                            reference: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditClient(null);
              setEditValues(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              void handleSaveEdit();
            }}
            disabled={Boolean(editClient && actionLoadingId === editClient.id)}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListaClientes;
