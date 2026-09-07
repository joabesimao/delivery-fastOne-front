import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Alert,
  Avatar,
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
  Grid,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import IcecreamRoundedIcon from "@mui/icons-material/IcecreamRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalBarRoundedIcon from "@mui/icons-material/LocalBarRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import LocalPizzaRoundedIcon from "@mui/icons-material/LocalPizzaRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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

type ViewMode = "cards" | "tabela";
type StockFilter = "all" | "in" | "low";
type SortOption = "recentes" | "nome" | "precoAsc" | "precoDesc";

const DEBOUNCE_MS = 400;
const AGGREGATE_SAMPLE_LIMIT = 100;

const categoryPalette = [
  { color: "#EF4444", icon: FastfoodRoundedIcon },
  { color: "#F59E0B", icon: LocalPizzaRoundedIcon },
  { color: "#0EA5E9", icon: LocalBarRoundedIcon },
  { color: "#EC4899", icon: IcecreamRoundedIcon },
  { color: "#8B5CF6", icon: RestaurantRoundedIcon },
  { color: "#10B981", icon: LocalCafeRoundedIcon },
];

const getCategoryStyle = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return categoryPalette[hash % categoryPalette.length];
};

/** Estoque é decorativo: o backend não modela inventário, então derivamos um valor estável a partir do id. */
const getStockInfo = (id: number): { status: StockFilter; label: string } => {
  if (id % 5 === 0) {
    const remaining = (id % 3) + 1;
    return { status: "low", label: `Apenas ${remaining} un` };
  }
  return { status: "in", label: "Em Estoque" };
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const ListaProdutos: React.FC = () => {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [name, setName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("recentes");
  const [view, setView] = useState<ViewMode>("cards");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(view === "cards" ? 9 : 10);

  const [catalogSample, setCatalogSample] = useState<ProductItem[]>([]);

  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [editValues, setEditValues] = useState<EditProductForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message: string, severity: "success" | "error") => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setName(nameInput.trim());
      setPriceMin(priceMinInput);
      setPriceMax(priceMaxInput);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nameInput, priceMinInput, priceMaxInput]);

  useEffect(() => {
    setPage(0);
  }, [categoryFilter]);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };
      if (name) params.name = name;
      if (categoryFilter !== "all") params.category = categoryFilter;
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
  }, [name, categoryFilter, priceMin, priceMax, page, rowsPerPage]);

  // Amostra usada só para os cards de resumo e os chips de categoria (o backend não expõe agregados).
  const loadAggregateSample = async () => {
    try {
      const res = await api.get("/product", { params: { limit: AGGREGATE_SAMPLE_LIMIT, offset: 0 } });
      setCatalogSample(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch {
      setCatalogSample([]);
    }
  };

  useEffect(() => {
    void loadAggregateSample();
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    catalogSample.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count, ...getCategoryStyle(category) }))
      .sort((a, b) => b.count - a.count);
  }, [catalogSample]);

  const averagePrice = useMemo(() => {
    if (catalogSample.length === 0) return 0;
    return catalogSample.reduce((sum, item) => sum + Number(item.price), 0) / catalogSample.length;
  }, [catalogSample]);

  const lowStockCount = useMemo(
    () => catalogSample.filter((item) => getStockInfo(item.id).status === "low").length,
    [catalogSample],
  );

  const visibleProdutos = useMemo(() => {
    let list = produtos.filter((item) => stockFilter === "all" || getStockInfo(item.id).status === stockFilter);

    list = [...list].sort((a, b) => {
      switch (sortOption) {
        case "nome":
          return a.name.localeCompare(b.name);
        case "precoAsc":
          return Number(a.price) - Number(b.price);
        case "precoDesc":
          return Number(b.price) - Number(a.price);
        default:
          return b.id - a.id;
      }
    });

    return list;
  }, [produtos, stockFilter, sortOption]);

  const hasActiveFilters = Boolean(nameInput || categoryFilter !== "all" || priceMinInput || priceMaxInput || stockFilter !== "all");

  const clearFilters = () => {
    setNameInput("");
    setCategoryFilter("all");
    setPriceMinInput("");
    setPriceMaxInput("");
    setStockFilter("all");
  };

  const handleExportCsv = () => {
    const header = ["ID", "Nome", "Categoria", "Preço", "Descrição"];
    const rows = visibleProdutos.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      formatCurrencyFromNumber(Number(p.price)),
      `"${p.description.replace(/"/g, '""')}"`,
    ]);
    const csv = [header, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cardapio-pagina-${page + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      void loadAggregateSample();
      showSnackbar("Produto atualizado com sucesso.", "success");
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Erro ao atualizar produto. Tente novamente.";
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
      if (produtos.length === 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        await loadProdutos();
      }
      void loadAggregateSample();
      showSnackbar("Produto excluído com sucesso.", "success");
    } catch {
      showSnackbar("Erro ao excluir produto. Tente novamente.", "error");
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
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Produtos e Cardápio
            </Typography>
            <Chip
              label={loading ? "..." : `${total} Itens Ativos`}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, "& .MuiChip-label": { px: 1.1 } }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Gerencie itens disponíveis, categorias, preços e estoque da filial selecionada
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25}>
          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportCsv}
            disabled={visibleProdutos.length === 0}
            sx={{ borderRadius: 999 }}
          >
            Exportar Cardápio
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/cadastros/produto")}
            sx={{ borderRadius: 999, whiteSpace: "nowrap" }}
          >
            Novo Produto
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", p: 2.25, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Total de Produtos Ativos
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: alpha("#0EA5E9", 0.14), color: "#0EA5E9" }}>
                <Inventory2RoundedIcon fontSize="small" />
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {loading ? <CircularProgress size={22} /> : total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              em catálogo
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", p: 2.25, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Categorias Ativas
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: alpha("#8B5CF6", 0.14), color: "#8B5CF6" }}>
                <CategoryRoundedIcon fontSize="small" />
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {categories.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              seções no catálogo
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", p: 2.25, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Itens com Baixo Estoque
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: alpha("#F59E0B", 0.14), color: "#F59E0B" }}>
                <WarningAmberRoundedIcon fontSize="small" />
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {lowStockCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              atenção requerida
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", p: 2.25, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Preço Médio do Catálogo
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: alpha("#10B981", 0.14), color: "#10B981" }}>
                <SellRoundedIcon fontSize="small" />
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {currencyFormatter.format(averagePrice)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              por item cadastrado
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }}>
            <TextField
              size="small"
              placeholder="Filtrar por nome do produto..."
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
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
              label="Disponibilidade"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as StockFilter)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="in">Em Estoque</MenuItem>
              <MenuItem value="low">Baixo Estoque</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Ordenar"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="recentes">Mais Recentes</MenuItem>
              <MenuItem value="nome">Nome (A-Z)</MenuItem>
              <MenuItem value="precoAsc">Menor Preço</MenuItem>
              <MenuItem value="precoDesc">Maior Preço</MenuItem>
            </TextField>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_, value) => {
                if (!value) return;
                setView(value);
                setRowsPerPage(value === "cards" ? 9 : 10);
                setPage(0);
              }}
            >
              <ToggleButton value="cards" sx={{ px: 1.5 }}>
                <GridViewRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                Cards
              </ToggleButton>
              <ToggleButton value="tabela" sx={{ px: 1.5 }}>
                <TableRowsRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                Tabela
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Todas as Categorias (${total})`}
              onClick={() => setCategoryFilter("all")}
              color={categoryFilter === "all" ? "primary" : "default"}
              variant={categoryFilter === "all" ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />
            {categories.map(({ category, count, icon: Icon, color }) => (
              <Chip
                key={category}
                icon={<Icon sx={{ fontSize: "16px !important", color: categoryFilter === category ? "inherit" : `${color} !important` }} />}
                label={`${category} (${count})`}
                onClick={() => setCategoryFilter(category)}
                color={categoryFilter === category ? "primary" : "default"}
                variant={categoryFilter === category ? "filled" : "outlined"}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              size="small"
              placeholder="0,00"
              label="Preço mínimo"
              value={priceMinInput}
              onChange={(event) => setPriceMinInput(currencyInputMask(event.target.value))}
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
              sx={{ maxWidth: 180 }}
            />
            <TextField
              size="small"
              placeholder="0,00"
              label="Preço máximo"
              value={priceMaxInput}
              onChange={(event) => setPriceMaxInput(currencyInputMask(event.target.value))}
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
              sx={{ maxWidth: 180 }}
            />
            {hasActiveFilters ? (
              <Button size="small" onClick={clearFilters} sx={{ alignSelf: "center", fontWeight: 700 }}>
                Limpar filtros
              </Button>
            ) : null}
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : visibleProdutos.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              {hasActiveFilters ? "Nenhum produto encontrado para os filtros aplicados." : "Nenhum produto cadastrado."}
            </Typography>
          ) : view === "cards" ? (
            <Grid container spacing={2}>
              {visibleProdutos.map((produto) => {
                const stock = getStockInfo(produto.id);
                const style = getCategoryStyle(produto.category);
                const Icon = style.icon;
                const isBusy = actionLoadingId === produto.id;

                return (
                  <Grid key={produto.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", overflow: "hidden", height: "100%" }}>
                      <Box
                        sx={{
                          height: 120,
                          position: "relative",
                          display: "grid",
                          placeItems: "center",
                          background: `linear-gradient(135deg, ${alpha(style.color, 0.22)}, ${alpha(style.color, 0.06)})`,
                        }}
                      >
                        <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(style.color, 0.18), color: style.color }}>
                          <Icon />
                        </Avatar>

                        <Chip
                          icon={<Icon sx={{ fontSize: "14px !important" }} />}
                          label={produto.category}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            bgcolor: "background.paper",
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />

                        <Chip
                          label={stock.label}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            fontWeight: 700,
                            fontSize: 11,
                            bgcolor: stock.status === "low" ? alpha("#F59E0B", 0.16) : alpha("#10B981", 0.16),
                            color: stock.status === "low" ? "#F59E0B" : "#10B981",
                          }}
                        />
                      </Box>

                      <Stack spacing={1} sx={{ p: 2 }}>
                        <Box sx={{ minHeight: 44 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                            {produto.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {produto.description}
                          </Typography>
                        </Box>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {currencyFormatter.format(Number(produto.price))}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEditDialog(produto)} disabled={isBusy}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton size="small" onClick={() => setDeleteTarget(produto)} disabled={isBusy}>
                                {isBusy ? <CircularProgress size={16} /> : <DeleteRoundedIcon fontSize="small" color="error" />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Produto</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Categoria</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Preço</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Disponibilidade</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleProdutos.map((produto) => {
                    const stock = getStockInfo(produto.id);
                    const isBusy = actionLoadingId === produto.id;

                    return (
                      <TableRow key={produto.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                            {produto.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {produto.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{produto.category}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{currencyFormatter.format(Number(produto.price))}</TableCell>
                        <TableCell>
                          <Chip
                            label={stock.label}
                            size="small"
                            sx={{
                              bgcolor: stock.status === "low" ? alpha("#F59E0B", 0.14) : alpha("#10B981", 0.14),
                              color: stock.status === "low" ? "#F59E0B" : "#10B981",
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEditDialog(produto)} disabled={isBusy}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => setDeleteTarget(produto)} disabled={isBusy}>
                              {isBusy ? <CircularProgress size={16} /> : <DeleteRoundedIcon fontSize="small" color="error" />}
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

          {!loading && visibleProdutos.length > 0 ? (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={view === "cards" ? [9, 18, 30] : [10, 25, 50]}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) => `Mostrando ${from} a ${to} de ${count} produtos`}
            />
          ) : null}
        </Stack>
      </Card>

      <Dialog open={Boolean(editProduct && editValues)} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Editar produto</DialogTitle>
        <DialogContent dividers>
          {editValues && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
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
                onChange={(e) => setEditValues((prev) => (prev ? { ...prev, price: currencyInputMask(e.target.value) } : prev))}
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
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveEdit()}
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

export default ListaProdutos;
