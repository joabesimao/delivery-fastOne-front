import { MenuItem, TextField } from "@mui/material";
import { ALL } from "../../domain/deliveryFilters";

interface FilterSelectProps {
  label: string;
  allLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const FilterSelect = ({
  label,
  allLabel,
  value,
  options,
  onChange,
}: FilterSelectProps) => (
  <TextField
    select
    size="small"
    fullWidth
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    <MenuItem value={ALL}>{allLabel}</MenuItem>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

export default FilterSelect;
