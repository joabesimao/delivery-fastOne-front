import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

type SearchFieldProps = Omit<
  TextFieldProps,
  "value" | "onChange" | "slotProps"
> & {
  value: string;
  onChange: (value: string) => void;
  clearable?: boolean;
};

const SearchField = ({
  value,
  onChange,
  clearable = false,
  ...props
}: SearchFieldProps) => (
  <TextField
    size="small"
    {...props}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon
              fontSize="small"
              sx={{ color: "text.secondary" }}
            />
          </InputAdornment>
        ),
        endAdornment:
          clearable && value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Limpar busca"
                onClick={() => onChange("")}
              >
                <ClearIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
      },
    }}
  />
);

export default SearchField;
