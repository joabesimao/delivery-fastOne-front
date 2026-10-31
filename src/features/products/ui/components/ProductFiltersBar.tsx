import {
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import { currencyInputMask } from "@/shared/lib/masks";
import SearchField from "@/shared/ui/form/SearchField";
import {
  ALL_CATEGORIES,
  SORT_OPTIONS,
  STOCK_OPTIONS,
  type CategoryCount,
  type ProductFilters,
  type ProductSortOption,
  type ProductViewMode,
  type StockFilter,
} from "../../domain/productCatalog";
import { categoryStyleOf } from "./categoryStyle";

interface ProductFiltersBarProps {
  filters: ProductFilters;
  stock: StockFilter;
  sort: ProductSortOption;
  view: ProductViewMode;
  total: number;
  categories: CategoryCount[];
  hasActiveFilters: boolean;
  onFiltersChange: (changes: Partial<ProductFilters>) => void;
  onStockChange: (stock: StockFilter) => void;
  onSortChange: (sort: ProductSortOption) => void;
  onViewChange: (view: ProductViewMode) => void;
  onClear: () => void;
}

const PriceField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <TextField
    size="small"
    placeholder="0,00"
    label={label}
    value={value}
    onChange={(event) => onChange(currencyInputMask(event.target.value))}
    slotProps={{
      htmlInput: { inputMode: "numeric" },
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <Typography variant="caption" color="text.secondary">
              R$
            </Typography>
          </InputAdornment>
        ),
      },
    }}
    sx={{ maxWidth: 180 }}
  />
);

const ProductFiltersBar = ({
  filters,
  stock,
  sort,
  view,
  total,
  categories,
  hasActiveFilters,
  onFiltersChange,
  onStockChange,
  onSortChange,
  onViewChange,
  onClear,
}: ProductFiltersBarProps) => (
  <>
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", lg: "center" }}
    >
      <SearchField
        placeholder="Filtrar por nome do produto..."
        value={filters.name}
        onChange={(name) => onFiltersChange({ name })}
        sx={{ flex: 1 }}
      />
      <TextField
        select
        size="small"
        label="Disponibilidade"
        value={stock}
        onChange={(event) => onStockChange(event.target.value as StockFilter)}
        sx={{ minWidth: 170 }}
      >
        {STOCK_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Ordenar"
        value={sort}
        onChange={(event) =>
          onSortChange(event.target.value as ProductSortOption)
        }
        sx={{ minWidth: 170 }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={view}
        onChange={(_, value: ProductViewMode | null) =>
          value && onViewChange(value)
        }
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
        onClick={() => onFiltersChange({ category: ALL_CATEGORIES })}
        color={filters.category === ALL_CATEGORIES ? "primary" : "default"}
        variant={filters.category === ALL_CATEGORIES ? "filled" : "outlined"}
        sx={{ fontWeight: 700 }}
      />
      {categories.map(({ category, count }) => {
        const { icon: Icon, color } = categoryStyleOf(category);
        const selected = filters.category === category;
        return (
          <Chip
            key={category}
            icon={
              <Icon
                sx={{
                  fontSize: "16px !important",
                  color: selected ? "inherit" : `${color} !important`,
                }}
              />
            }
            label={`${category} (${count})`}
            onClick={() => onFiltersChange({ category })}
            color={selected ? "primary" : "default"}
            variant={selected ? "filled" : "outlined"}
            sx={{ fontWeight: 700 }}
          />
        );
      })}
    </Stack>

    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <PriceField
        label="Preço mínimo"
        value={filters.priceMin}
        onChange={(priceMin) => onFiltersChange({ priceMin })}
      />
      <PriceField
        label="Preço máximo"
        value={filters.priceMax}
        onChange={(priceMax) => onFiltersChange({ priceMax })}
      />
      {hasActiveFilters && (
        <Button
          size="small"
          onClick={onClear}
          sx={{ alignSelf: "center", fontWeight: 700 }}
        >
          Limpar filtros
        </Button>
      )}
    </Stack>
  </>
);

export default ProductFiltersBar;
