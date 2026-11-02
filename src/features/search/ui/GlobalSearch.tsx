import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  ClickAwayListener,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import { ROUTES } from "@/shared/config/routes";
import SearchField from "@/shared/ui/form/SearchField";
import { hasAnyResult, isSearchable } from "../domain/searchResults";
import { useGlobalSearch } from "../application/useGlobalSearch";
import SearchResultsList from "./SearchResultsList";

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const { results, loading } = useGlobalSearch(term);

  const goTo = (path: string, search: string) => {
    setTerm("");
    setOpen(false);
    navigate(path, { state: { search } });
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box
        ref={setAnchorEl}
        sx={{ flex: 1, minWidth: 0, display: { xs: "none", sm: "block" } }}
      >
        <SearchField
          fullWidth
          placeholder="Buscar pedido, cliente, entregador..."
          value={term}
          onChange={(value) => {
            setTerm(value);
            setOpen(true);
          }}
          onFocus={() => {
            if (isSearchable(term)) setOpen(true);
          }}
        />

        <Popper
          open={open && isSearchable(term)}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{
            zIndex: (t) => t.zIndex.drawer + 2,
            width: anchorEl?.clientWidth,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              mt: 0.5,
              borderRadius: 2,
              overflow: "hidden",
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 3,
                }}
              >
                <CircularProgress size={20} />
              </Box>
            ) : hasAnyResult(results) ? (
              <SearchResultsList
                results={results}
                onSelectOrder={(order) =>
                  goTo(ROUTES.deliveries, String(order.id))
                }
                onSelectClient={(client) => goTo(ROUTES.clients, client.name)}
                onSelectDeliveryman={(deliveryman) =>
                  goTo(ROUTES.deliverymen, deliveryman.name)
                }
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                Nenhum resultado encontrado.
              </Typography>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearch;
