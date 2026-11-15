import { MenuItem, TextField, type SxProps, type Theme } from "@mui/material";
import { SORT_ORDER_OPTIONS, type SortOrder } from "@/shared/lib/sortOrder";

interface SortOrderSelectProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
  label?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  inputSx?: SxProps<Theme>;
}

const SortOrderSelect = ({
  value,
  onChange,
  label,
  fullWidth,
  sx,
  inputSx,
}: SortOrderSelectProps) => (
  <TextField
    select
    size="small"
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value as SortOrder)}
    fullWidth={fullWidth}
    sx={sx}
    slotProps={{
      input: { sx: inputSx },
      select: {
        SelectDisplayProps: label ? undefined : { "aria-label": "Ordenar" },
      },
    }}
  >
    {SORT_ORDER_OPTIONS.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

export default SortOrderSelect;
