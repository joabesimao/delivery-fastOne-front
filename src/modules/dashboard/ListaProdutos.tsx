import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { currencyInputMask, formatCurrencyFromNumber, parseCurrencyToNumber } from "../../helpers/masks";

interface ProductItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface EditProductForm {
  name: string;
  price: string;
  description: string;
  category: string;
}

const DEBOUNCE_MS = 400;

const ListaProdutos: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Filtros (valor digitado x valor aplicado após debounce)
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Paginação (server-side)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [editValues, setEditValues] = useState<EditProductForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Debounce dos campos de texto/preço
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setName(nameInput.trim());
      setCategory(categoryInput.trim());
      setPriceMin(priceMinInput);
      setPriceMax(priceMaxInput);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nameInput, categoryInput, priceMinInput, priceMaxInput]);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };
      if (name) params.name = name;
      if (category) params.category = category;
      if (priceMin) {
        const min = parseCurrencyToNumber(priceMin);
        if (!Number.isNaN(min)) params.priceMin = min;
      }
      if (priceMax) {
        const max = parseCurrencyToNumber(priceMax);
        if (!Number.isNaN(max)) params.priceMax = max;
      }

      const res = await api.get("/product", { params });
      setProdutos(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(res.data?.pagination?.total ?? 0);
      setError(null);
    } catch {
      setError("Erro ao carregar a lista de produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, category, priceMin, priceMax, page, rowsPerPage]);

  const hasActiveFilters = useMemo(
    () => Boolean(nameInput || categoryInput || priceMinInput || priceMaxInput),
    [nameInput, categoryInput, priceMinInput, priceMaxInput]
  );

  const clearFilters = () => {
    setNameInput("");
    setCategoryInput("");
    setPriceMinInput("");
    setPriceMaxInput("");
  };

  const openEditDialog = (produto: ProductItem) => {
    setEditProduct(produto);
    setEditValues({
      name: produto.name,
      price: formatCurrencyFromNumber(produto.price),
      description: produto.description,
      category: produto.category,
    });
  };

  const closeEditDialog = () => {
    setEditProduct(null);
    setEditValues(null);
  };

  const handleSaveEdit = async () => {
    if (!editProduct || !editValues) return;

    if (!editValues.name.trim() || !editValues.description.trim() || !editValues.category.trim()) {
      showSnackbar("Nome, descrição e categoria são obrigatórios.", "error");
      return;
    }

    const price = parseCurrencyToNumber(editValues.price);
    if (Number.isNaN(price) || price <= 0) {
      showSnackbar("Informe um preço válido.", "error");
      return;
    }

    try {
      setActionLoadingId(editProduct.id);
      await api.put(`/product/${editProduct.id}`, {
        name: editValues.name.trim(),
        price,
        description: editValues.description.trim(),
        category: editValues.category.trim(),
      });
      closeEditDialog();
      await loadProdutos();
      showSnackbar("Produto atualizado com sucesso.", "success");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erro ao atualizar produto. Tente novamente.";
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoadingId(deleteTarget.id);
      await api.delete(`/product/${deleteTarget.id}`);
      setDeleteTarget(null);
      // Evita página vazia ao excluir o último item da página atual.
      if (produtos.length === 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        await loadProdutos();
      }
      showSnackbar("Produto excluído com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao excluir produto. Tente novamente.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const cardBg = isDark ? "#111827" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const inputBg = isDark ? "#1f2937" : "#f9fafb";
  const rowHover = isDark ? "#1e2a3a" : "#f0f7ff";

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700} sx={{ color: textPrimary }}>
          Visualizar produtos cadastrados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          onClick={() => navigate("/cadastros/produto")}
          sx={{
            bgcolor: "#0ea5e9",
            "&:hover": { bgcolor: "#0284c7" },
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Cadastrar produto
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 1, border: `5px solid ${borderColor}`, bgcolor: cardBg, overflow: "hidden" }}>
        <Box display="flex" px={5} py={2.5} sx={{ borderBottom: `1px solid ${borderColor}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>
            Listagem de produtos
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={2} px={3} py={2.5} sx={{ borderBottom: `1px solid ${borderColor}` }}>
          <Box flex="1" minWidth={200}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Buscar por nome
            </Typography>
            <TextField
              size="small"
              placeholder="Digite o nome do produto"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: labelColor }} />
                    </InputAdornment>
                  ),
                  endAdornment: nameInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setNameInput("")}>
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{ width: "100%", "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: inputBg, fontSize: 13 } }}
            />
          </Box>

          <Box flex="1" minWidth={180}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Categoria
            </Typography>
            <TextField
              size="small"
              placeholder="Ex: Bebidas"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: categoryInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setCategoryInput("")}>
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{ width: "100%", "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: inputBg, fontSize: 13 } }}
            />
          </Box>

          <Box minWidth={130}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Preço mínimo
            </Typography>
            <TextField
              size="small"
              placeholder="0,00"
              value={priceMinInput}
              onChange={(e) => setPriceMinInput(currencyInputMask(e.target.value))}
              slotProps={{
                htmlInput: { inputMode: "numeric" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="caption" color="text.secondary">R$</Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: "100%", "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: inputBg, fontSize: 13 } }}
            />
          </Box>

          <Box minWidth={130}>
            <Typography variant="caption" sx={{ color: labelColor, fontWeight: 600, mb: 0.5, display: "block" }}>
              Preço máximo
            </Typography>
            <TextField
              size="small"
              placeholder="0,00"
              value={priceMaxInput}
              onChange={(e) => setPriceMaxInput(currencyInputMask(e.target.value))}
              slotProps={{
                htmlInput: { inputMode: "numeric" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="caption" color="text.secondary">R$</Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: "100%", "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: inputBg, fontSize: 13 } }}
            />
          </Box>

          {hasActiveFilters && (
            <Box display="flex" alignItems="flex-end">
              <Button
                size="small"
                onClick={clearFilters}
                startIcon={<ClearIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: "none", color: textSecondary, fontSize: 12 }}
              >
                Limpar filtros
              </Button>
            </Box>
          )}
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#0ea5e9" }} />
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
                    {["Produto", "ID", "Categoria", "Preço", "Descrição", "Ações"].map((col) => (
                      <TableCell
                        key={col}
                        sx={{ color: labelColor, fontWeight: 700, fontSize: 12, letterSpacing: 0.3, py: 1.5, borderColor, whiteSpace: "nowrap" }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produtos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: textSecondary, fontSize: 14, borderColor }}>
                        {hasActiveFilters ? "Nenhum produto encontrado para os filtros aplicados." : "Nenhum produto cadastrado."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    produtos.map((p) => {
                      const isBusy = actionLoadingId === p.id;
                      return (
                        <TableRow
                          key={p.id}
                          hover
                          sx={{ "&:hover": { bgcolor: rowHover }, "& td": { borderColor, fontSize: 13, py: 1.2 } }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: textPrimary }}>{p.name}</TableCell>
                          <TableCell sx={{ color: textSecondary }}>{p.id}</TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>{p.category}</TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151" }}>
                            R$ {formatCurrencyFromNumber(p.price)}
                          </TableCell>
                          <TableCell sx={{ color: isDark ? "#d1d5db" : "#374151", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.description}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(p)}
                                  disabled={isBusy}
                                  sx={{ bgcolor: "#f59e0b", borderRadius: 1.5, "&:hover": { bgcolor: "#d97706" } }}
                                >
                                  <EditIcon sx={{ fontSize: 16, color: "#fff" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteTarget(p)}
                                  disabled={isBusy}
                                  sx={{ bgcolor: "#ef4444", borderRadius: 1.5, "&:hover": { bgcolor: "#dc2626" } }}
                                >
                                  {isBusy ? (
                                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                                  ) : (
                                    <DeleteIcon sx={{ fontSize: 16, color: "#fff" }} />
                                  )}
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

            <Box display="flex" alignItems="center" justifyContent="space-between" px={3} sx={{ borderTop: `1px solid ${borderColor}` }}>
              <Typography sx={{ fontSize: 13, color: textSecondary }}>
                Total: {total} registro{total !== 1 ? "s" : ""}
              </Typography>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_: unknown, newPage: number) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Linhas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                sx={{
                  "& .MuiTablePagination-toolbar": { minHeight: 48 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, color: textSecondary },
                  color: textSecondary,
                }}
              />
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={Boolean(editProduct && editValues)} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Editar produto</DialogTitle>
        <DialogContent dividers>
          {editValues && (
            <Box display="grid" gap={1.5} pt={0.5}>
              <TextField
                label="Nome"
                size="small"
                value={editValues.name}
                onChange={(e) => setEditValues((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              />
              <TextField
                label="Preço"
                size="small"
                value={editValues.price}
                onChange={(e) =>
                  setEditValues((prev) => (prev ? { ...prev, price: currencyInputMask(e.target.value) } : prev))
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2" color="text.secondary">R$</Typography>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Categoria"
                size="small"
                value={editValues.category}
                onChange={(e) => setEditValues((prev) => (prev ? { ...prev, category: e.target.value } : prev))}
              />
              <TextField
                label="Descrição"
                size="small"
                multiline
                minRows={2}
                value={editValues.description}
                onChange={(e) => setEditValues((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              void handleSaveEdit();
            }}
            disabled={Boolean(editProduct && actionLoadingId === editProduct.id)}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Excluir produto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o produto <strong>{deleteTarget?.name}</strong>? Essa ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              void handleDelete();
            }}
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
    </Box>
  );
};

export default ListaProdutos;
