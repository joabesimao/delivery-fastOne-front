import React from "react";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export interface VehicleOption {
  id: number;
  plate: string;
  model: string;
}

export interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
}

interface FiltrosFrotaProps {
  vehicles: VehicleOption[];
  deliverymen: DeliverymanOption[];
  vehicleId: string;
  deliverymanId: string;
  onVehicleChange: (value: string) => void;
  onDeliverymanChange: (value: string) => void;
  onClear: () => void;
}

const FilterLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography
    variant="caption"
    sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5, display: "block" }}
  >
    {label}
  </Typography>
);

const FiltrosFrota: React.FC<FiltrosFrotaProps> = ({
  vehicles,
  deliverymen,
  vehicleId,
  deliverymanId,
  onVehicleChange,
  onDeliverymanChange,
  onClear,
}) => (
  <Box display="flex" flexWrap="wrap" alignItems="flex-end" gap={2} mb={3}>
    <Box flex="1" minWidth={200}>
      <FilterLabel label="Veículo" />
      <TextField
        select
        fullWidth
        size="small"
        value={vehicleId}
        onChange={(e) => onVehicleChange(e.target.value)}
      >
        <MenuItem value="">Todos os veículos</MenuItem>
        {vehicles.map((v) => (
          <MenuItem key={v.id} value={String(v.id)}>
            {v.plate} — {v.model}
          </MenuItem>
        ))}
      </TextField>
    </Box>
    <Box flex="1" minWidth={200}>
      <FilterLabel label="Entregador" />
      <TextField
        select
        fullWidth
        size="small"
        value={deliverymanId}
        onChange={(e) => onDeliverymanChange(e.target.value)}
      >
        <MenuItem value="">Todos os entregadores</MenuItem>
        {deliverymen.map((d) => (
          <MenuItem key={d.id} value={String(d.id)}>
            {d.name} {d.lastName}
          </MenuItem>
        ))}
      </TextField>
    </Box>
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

export default FiltrosFrota;
