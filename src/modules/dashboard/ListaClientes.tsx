import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
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

interface Address {
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
  Register?: {
    address: Address;
  };
}

const ListaClientes: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    api
      .get<ClientItem[]>("/client")
      .then((res) => setClientes(res.data))
      .catch(() => setError("Erro ao carregar a lista de clientes."))
      .finally(() => setLoading(false));
  }, []);

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
        !phoneTerm || c.phone.toLowerCase().includes(phoneTerm);

      const matchesCity =
        cityFilter === "all" || addr?.city === cityFilter;

      const matchesStatus =
        statusFilter === "all" || statusFilter === "ativo";

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
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: "hidden",
        }}
      >
        {/* Título do card */}
        <Box
          px={3}
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
              sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}
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
              sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}
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
                      <IconButton size="small" onClick={() => setPhoneSearch("")}>
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
              sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}
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
              sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}
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
                        sx={{ py: 6, color: textSecondary, fontSize: 14, borderColor }}
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
                                sx={{ fontWeight: 600, fontSize: 13, color: textPrimary }}
                              >
                                {c.name} {c.lastName}
                              </Typography>
                              {addr?.street && (
                                <Typography sx={{ fontSize: 11, color: textSecondary }}>
                                  {addr.street}
                                  {addr.numberHouse ? `, ${addr.numberHouse}` : ""}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: textSecondary }}>{c.id}</TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {c.phone}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {addr?.neighborhood ?? "—"}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            {addr?.city ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Ativo"
                              size="small"
                              sx={{
                                bgcolor: isDark ? "rgba(52,211,153,0.15)" : "#d1fae5",
                                color: isDark ? "#34d399" : "#065f46",
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
                                  sx={{
                                    bgcolor: isDark ? "#374151" : "#e5e7eb",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: isDark ? "#4b5563" : "#d1d5db" },
                                  }}
                                >
                                  <VisibilityIcon
                                    sx={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  sx={{
                                    bgcolor: "#f59e0b",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: "#d97706" },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16, color: "#fff" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Inativar">
                                <IconButton
                                  size="small"
                                  sx={{
                                    bgcolor: "#ef4444",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: "#dc2626" },
                                  }}
                                >
                                  <PowerSettingsNewIcon sx={{ fontSize: 16, color: "#fff" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mais opções">
                                <IconButton
                                  size="small"
                                  sx={{
                                    bgcolor: isDark ? "#374151" : "#e5e7eb",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: isDark ? "#4b5563" : "#d1d5db" },
                                  }}
                                >
                                  <MoreHorizIcon
                                    sx={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280" }}
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
                Total: {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
              </Typography>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_: unknown, newPage: number) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
    </Box>
  );
};

export default ListaClientes;
