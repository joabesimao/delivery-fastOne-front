import { Chip, Grid, Stack } from "@mui/material";
import SearchField from "@/shared/ui/form/SearchField";
import SortOrderSelect from "@/shared/ui/form/SortOrderSelect";
import type { SortOrder } from "@/shared/lib/sortOrder";
import type {
  DeliveryListFilters as Filters,
  DeliveryProgressFilter,
  NamedOption,
} from "../../domain/deliveryFilters";
import FilterSelect from "./FilterSelect";

interface DeliveryListFiltersProps {
  filters: Filters;
  loading: boolean;
  counts: Record<DeliveryProgressFilter, number>;
  deliverymen: NamedOption[];
  cities: string[];
  neighborhoods: string[];
  sortOrder: SortOrder;
  onChange: (changes: Partial<Filters>) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

const GRID_ITEM_SIZE = { xs: 12, sm: 6, md: 3 };

const PROGRESS_CHIPS: { value: DeliveryProgressFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "finished", label: "Finalizados" },
];

const toOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

const DeliveryListFilters = ({
  filters,
  loading,
  counts,
  deliverymen,
  cities,
  neighborhoods,
  sortOrder,
  onChange,
  onSortOrderChange,
}: DeliveryListFiltersProps) => (
  <>
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", md: "center" }}
    >
      <SearchField
        placeholder="Buscar por ID, cliente ou endereço..."
        value={filters.search}
        onChange={(search) => onChange({ search })}
        sx={{ flex: 1 }}
      />
      <Stack direction="row" spacing={1}>
        {PROGRESS_CHIPS.map((chip) => {
          const selected = filters.progress === chip.value;
          return (
            <Chip
              key={chip.value}
              label={`${chip.label} (${loading ? "…" : counts[chip.value]})`}
              onClick={() => onChange({ progress: chip.value })}
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />
          );
        })}
      </Stack>
    </Stack>

    <Grid container spacing={1.5}>
      <Grid size={GRID_ITEM_SIZE}>
        <FilterSelect
          label="Entregador"
          allLabel="Todos os entregadores"
          value={filters.deliverymanId}
          options={deliverymen.map((d) => ({
            value: String(d.id),
            label: d.name,
          }))}
          onChange={(deliverymanId) => onChange({ deliverymanId })}
        />
      </Grid>
      <Grid size={GRID_ITEM_SIZE}>
        <FilterSelect
          label="Cidade"
          allLabel="Todas as cidades"
          value={filters.city}
          options={toOptions(cities)}
          onChange={(city) => onChange({ city })}
        />
      </Grid>
      <Grid size={GRID_ITEM_SIZE}>
        <FilterSelect
          label="Bairro"
          allLabel="Todos os bairros"
          value={filters.neighborhood}
          options={toOptions(neighborhoods)}
          onChange={(neighborhood) => onChange({ neighborhood })}
        />
      </Grid>
      <Grid size={GRID_ITEM_SIZE}>
        <SortOrderSelect
          label="Ordenar"
          value={sortOrder}
          onChange={onSortOrderChange}
          fullWidth
        />
      </Grid>
    </Grid>
  </>
);

export default DeliveryListFilters;
