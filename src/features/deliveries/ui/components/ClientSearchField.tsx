import { Autocomplete, TextField } from "@mui/material";
import type { ClientRegister } from "@/features/clients";
import FieldLabel from "@/shared/ui/form/FieldLabel";

interface ClientSearchFieldProps {
  registers: ClientRegister[];
  loading: boolean;
  selectedId: number | null;
  error?: string;
  onSelect: (register: ClientRegister | null) => void;
}

const ClientSearchField = ({
  registers,
  loading,
  selectedId,
  error,
  onSelect,
}: ClientSearchFieldProps) => (
  <>
    <FieldLabel label="Pesquisar por nome *" />
    <Autocomplete
      options={registers}
      loading={loading}
      value={registers.find((r) => r.id === selectedId) ?? null}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name}
      filterOptions={(options, { inputValue }) => {
        const term = inputValue.toLowerCase();
        return options.filter((o) => o.name.toLowerCase().includes(term));
      }}
      onChange={(_, selected) => onSelect(selected)}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          fullWidth
          placeholder="Digite o nome do cliente..."
          error={Boolean(error)}
          helperText={error}
        />
      )}
    />
  </>
);

export default ClientSearchField;
