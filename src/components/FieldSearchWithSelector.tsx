import {
  Box,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

interface SearchField {
  id: string;
  name: string;
  placeholder: string;
}

interface FieldSearchWithSelectorProps {
  label?: string;
  searchFields: SearchField[];
  sx?: object;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldChange?: (fieldId: string) => void;
  sxBoxDad?: object;
  defaultFieldId?: string;
}

export const FieldSearchWithSelector = (
  props: FieldSearchWithSelectorProps,
) => {
  const {
    label = "",
    value,
    onChange,
    searchFields,
    onFieldChange,
    sx = {},
    sxBoxDad = {},
    defaultFieldId,
  } = props;

  const [selectedField, setSelectedField] = useState<string>(
    defaultFieldId || (searchFields.length > 0 ? searchFields[0].id : ""),
  );

  const currentField =
    searchFields.find((field) => field.id === selectedField) || searchFields[0];

  const handleFieldChange = (newFieldId: string) => {
    setSelectedField(newFieldId);
    if (onFieldChange) {
      onFieldChange(newFieldId);
    }
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ ...sxBoxDad }}>
      {label && (
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
      )}
      <OutlinedInput
        id="input-with-selector-search"
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
        type="text"
        value={value}
        placeholder={currentField?.placeholder || "Pesquisar..."}
        onChange={onChange}
        startAdornment={
          <InputAdornment position="start">
            <Select
              value={selectedField}
              onChange={(e) => handleFieldChange(e.target.value)}
              variant="standard"
              disableUnderline
              sx={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#3F4254",
                "& .MuiSelect-select": {
                  paddingRight: "24px",
                  paddingLeft: "0px",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: "18px",
                },
                marginRight: "8px",
                minWidth: "80px",
              }}
            >
              {searchFields.map((field) => (
                <MenuItem
                  key={field.id}
                  value={field.id}
                  sx={{ fontSize: "14px" }}
                >
                  {field.name}
                </MenuItem>
              ))}
            </Select>
            <Box
              sx={{
                height: "24px",
                width: "1px",
                backgroundColor: "#E0E0E0",
                marginRight: "8px",
              }}
            />
            <SearchIcon sx={{ color: "#71717A" }} />
          </InputAdornment>
        }
      />
    </Box>
  );
};