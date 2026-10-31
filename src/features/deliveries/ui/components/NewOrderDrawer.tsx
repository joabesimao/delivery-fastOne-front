import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { PreloadedDeliveryClient } from "../../domain/deliveryOrder";
import CreateDeliveryOrder from "./CreateDeliveryOrder";

interface NewOrderDrawerProps {
  open: boolean;
  preloadedClient: PreloadedDeliveryClient | null;
  onClose: () => void;
}

const CONTENT_SX = { maxWidth: 1600, mx: "auto", width: "100%" };

const NewOrderDrawer = ({
  open,
  preloadedClient,
  onClose,
}: NewOrderDrawerProps) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    sx={{ "& .MuiDrawer-paper": { width: "100%" } }}
  >
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Box sx={CONTENT_SX}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            <IconButton size="small" onClick={onClose} aria-label="Fechar">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "text.primary" }}
            >
              Criar Novo Pedido
            </Typography>
            <Box sx={{ width: 32 }} />
          </Box>
          <Divider sx={{ mb: 3 }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        <Box sx={CONTENT_SX}>
          <CreateDeliveryOrder
            embedded
            preloadedClient={preloadedClient}
            onClose={onClose}
          />
        </Box>
      </Box>
    </Stack>
  </Drawer>
);

export default NewOrderDrawer;
