import { Box, InputAdornment, InputLabel, OutlinedInput } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface FieldProps {
  label: string;
  placeholder: string;
  sx?: object;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sxBoxDad?: object
  showInputAdornment?: boolean;
  type?: string;
}
export const FieldSearch = (props: FieldProps) => {
  const { label, value, onChange, placeholder, sx = {}, sxBoxDad = {}, showInputAdornment = true, type = "text" } = props;

  return (
    <Box display="flex" flexDirection="column" sx={{...sxBoxDad}}>
      <InputLabel
        sx={{
          marginBottom: "4px",
          fontWeight: "600",
          fontSize: "14px",
          color: "#3F4254",
        }}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        id="input-with-icon-textfield"
        size="small"
        sx={{
          borderRadius: "7px",
          "& fieldset": { borderRadius: "7px" },
          "&:focus-within fieldset": { borderRadius: "7px" },
          "& input::placeholder": {
            fontSize: "14px",
          },
          fontSize: "14px",
           ...sx,
        }}
        type ={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        startAdornment={
          showInputAdornment ? (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ) : undefined
        }
      />
    </Box>
  );
};