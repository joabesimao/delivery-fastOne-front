import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { ROUTES } from "@/shared/config/routes";
import { downloadTextFile } from "@/shared/lib/downloadFile";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebouncedValue";
import { useResettablePage } from "@/shared/lib/hooks/useResettablePage";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import type { Product } from "../../domain/product";
import {
  ALL_CATEGORIES,
  ROWS_PER_PAGE_BY_VIEW,
  ROWS_PER_PAGE_OPTIONS_BY_VIEW,
  catalogCsvFileName,
  summarizeCatalog,
  toCatalogCsv,
  toProductListParams,
  visibleProducts,
  type ProductFilters,
  type ProductSortOption,
  type ProductViewMode,
  type StockFilter,
} from "../../domain/productCatalog";
import {
  useCatalogSample,
  useDeleteProduct,
  useProductPage,
} from "../../application/productQueries";
import ProductCardGrid from "../components/ProductCardGrid";
import ProductEditDialog from "../components/ProductEditDialog";
import ProductFiltersBar from "../components/ProductFiltersBar";
import ProductStatCards from "../components/ProductStatCards";
import ProductTable from "../components/ProductTable";

const DEBOUNCE_MS = 400;

const EMPTY_FILTERS: ProductFilters = {
  name: "",
  category: ALL_CATEGORIES,
  priceMin: "",
  priceMax: "",
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();

  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [stock, setStock] = useState<StockFilter>("all");
  const [sort, setSort] = useState<ProductSortOption>("recent");
  const [layout, setLayout] = useState<{
    view: ProductViewMode;
    rowsPerPage: number;
  }>({
    view: "cards",
    rowsPerPage: ROWS_PER_PAGE_BY_VIEW.cards,
  });
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const typedInput = useMemo(
    () => ({
      name: filters.name.trim(),
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
    }),
    [filters.name, filters.priceMin, filters.priceMax],
  );
  const typed = useDebouncedValue(typedInput, DEBOUNCE_MS);
  const [page, setPage] = useResettablePage(
    JSON.stringify([typed, filters.category, layout]),
  );

  const params = useMemo(
    () =>
      toProductListParams({
        ...typed,
        category: filters.category,
        page,
        rowsPerPage: layout.rowsPerPage,
      }),
    [typed, filters.category, page, layout.rowsPerPage],
  );

  const pageQuery = useProductPage(params);
  const sampleQuery = useCatalogSample();
  const deleteProduct = useDeleteProduct();

  const products = useMemo(() => pageQuery.data?.items ?? [], [pageQuery.data]);
  const total = pageQuery.data?.total ?? 0;
  const loading = pageQuery.isPending || pageQuery.isPlaceholderData;
  const summary = useMemo(
    () => summarizeCatalog(sampleQuery.data?.items ?? []),
    [sampleQuery.data],
  );
  const visible = useMemo(
    () => visibleProducts(products, stock, sort),
    [products, stock, sort],
  );

  const hasActiveFilters = Boolean(
    filters.name ||
    filters.category !== ALL_CATEGORIES ||
    filters.priceMin ||
    filters.priceMax ||
    stock !== "all",
  );
  const busyId = deleteProduct.isPending
    ? (deleteProduct.variables ?? null)
    : null;

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setStock("all");
  };

  const handleExport = () =>
    downloadTextFile(
      `\uFEFF${toCatalogCsv(visible)}`,
      catalogCsvFileName(page),
      "text/csv;charset=utf-8;",
    );

  const handleDelete = async () => {
    if (!deleting) return;
    const wasLastOnPage = products.length === 1 && page > 0;
    const succeeded = await runWithFeedback(
      () => deleteProduct.mutateAsync(deleting.id),
      {
        success: "Produto excluído com sucesso.",
        error: "Erro ao excluir produto. Tente novamente.",
        showApiError: false,
      },
    );
    if (!succeeded) return;
    setDeleting(null);
    if (wasLastOnPage) setPage(page - 1);
  };

  const ListView = layout.view === "cards" ? ProductCardGrid : ProductTable;

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
              Produtos
            </Typography>
            <Chip
              label={loading ? "..." : `${total} Itens Ativos`}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, "& .MuiChip-label": { px: 1.1 } }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Gerencie itens disponíveis, categorias, preços e estoque da filial
            selecionada
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25}>
          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExport}
            disabled={visible.length === 0}
            sx={{ borderRadius: 999 }}
          >
            Exportar Cardápio
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate(ROUTES.registerProduct)}
            sx={{ borderRadius: 999, whiteSpace: "nowrap" }}
          >
            Novo Produto
          </Button>
        </Stack>
      </Stack>

      <ProductStatCards
        loading={loading}
        total={total}
        categories={summary.categories.length}
        lowStock={summary.lowStockCount}
        averagePrice={summary.averagePrice}
      />

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <ProductFiltersBar
            filters={filters}
            stock={stock}
            sort={sort}
            view={layout.view}
            total={total}
            categories={summary.categories}
            hasActiveFilters={hasActiveFilters}
            onFiltersChange={(changes) =>
              setFilters((current) => ({ ...current, ...changes }))
            }
            onStockChange={setStock}
            onSortChange={setSort}
            onViewChange={(view) =>
              setLayout({ view, rowsPerPage: ROWS_PER_PAGE_BY_VIEW[view] })
            }
            onClear={clearFilters}
          />

          {pageQuery.isError && (
            <Alert severity="error">
              Erro ao carregar a lista de produtos.
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : visible.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              {hasActiveFilters
                ? "Nenhum produto encontrado para os filtros aplicados."
                : "Nenhum produto cadastrado."}
            </Typography>
          ) : (
            <ListView
              products={visible}
              busyId={busyId}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          )}

          {!loading && visible.length > 0 && (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, next) => setPage(next)}
              rowsPerPage={layout.rowsPerPage}
              onRowsPerPageChange={(event) =>
                setLayout((current) => ({
                  ...current,
                  rowsPerPage: Number(event.target.value),
                }))
              }
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS_BY_VIEW[layout.view]}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                `Mostrando ${from} a ${to} de ${count} produtos`
              }
            />
          )}
        </Stack>
      </Card>

      <ProductEditDialog product={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir produto"
        message={
          <>
            Tem certeza que deseja excluir o produto{" "}
            <strong>{deleting?.name}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={Boolean(deleting && busyId === deleting.id)}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Stack>
  );
};

export default ProductsPage;
