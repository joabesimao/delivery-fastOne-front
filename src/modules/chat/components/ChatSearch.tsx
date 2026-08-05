import {
  TextField,
  InputAdornment,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useState, useCallback } from "react";

interface ChatSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const ChatSearch = ({
  onSearch,
  placeholder = "Buscar mensagens...",
}: ChatSearchProps) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      onSearch(value);
    },
    [onSearch],
  );

  const handleAddFilter = useCallback((filter: string) => {
    setFilters((prev) => [...prev, filter]);
  }, []);

  const handleRemoveFilter = useCallback((filter: string) => {
    setFilters((prev) => prev.filter((f) => f !== filter));
  }, []);

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <Box
                component="button"
                onClick={() => handleSearch("")}
                sx={{
                  border: "none",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  p: 0,
                }}
              >
                <ClearIcon fontSize="small" />
              </Box>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          mb: filters.length > 0 ? 1.5 : 0,
        }}
      />

      {filters.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          {filters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              size="small"
              onDelete={() => handleRemoveFilter(filter)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
