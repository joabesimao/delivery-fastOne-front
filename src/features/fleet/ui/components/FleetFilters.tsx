import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { SelectOption } from "@/shared/ui/form/FormSelectField";

interface FleetFiltersProps {
  vehicleOptions: SelectOption[];
  deliverymanOptions: SelectOption[];
  vehicleId: string;
  deliverymanId: string;
  onVehicleChange: (value: string) => void;
  onDeliverymanChange: (value: string) => void;
  onClear: () => void;
}

const FilterLabel = ({ label }: { label: string }) => (
  <Typography
    variant="caption"
    sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5, display: "block" }}
  >
    {label}
  </Typography>
);

interface FilterSelectProps {
  label: string;
  allLabel: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const FilterSelect = ({
  label,
  allLabel,
  value,
  options,
  onChange,
}: FilterSelectProps) => (
  <Box flex="1" minWidth={200}>
    <FilterLabel label={label} />
    <TextField
      select
      fullWidth
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  </Box>
);

const FleetFilters = ({
  vehicleOptions,
  deliverymanOptions,
  vehicleId,
  deliverymanId,
  onVehicleChange,
  onDeliverymanChange,
  onClear,
}: FleetFiltersProps) => (
  <Box display="flex" flexWrap="wrap" alignItems="flex-end" gap={2} mb={3}>
    <FilterSelect
      label="Veículo"
      allLabel="Todos os veículos"
      value={vehicleId}
      options={vehicleOptions}
      onChange={onVehicleChange}
    />
    <FilterSelect
      label="Entregador"
      allLabel="Todos os entregadores"
      value={deliverymanId}
      options={deliverymanOptions}
      onChange={onDeliverymanChange}
    />
    <Button
      variant="outlined"
      startIcon={<ClearIcon />}
      disabled={!vehicleId && !deliverymanId}
      onClick={onClear}
      sx={{ textTransform: "none", height: 40 }}
    >
      Limpar filtros
    </Button>
  </Box>
);

export default FleetFilters;
