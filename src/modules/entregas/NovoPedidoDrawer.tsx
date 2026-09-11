import React from "react";
import { Box, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EntregaForm from "./EntregaForm";

interface NovoPedidoDrawerProps {
  open: boolean;
  onClose: () => void;
  preloadedClientData?: {
    name: string;
    phone: string;
    address: {
      street: string;
      neighborhood: string;
      numberHouse: string;
      reference: string;
      city: string;
    };
  } | null;
  preloadedClientId?: number | null;
}

const NovoPedidoDrawer: React.FC<NovoPedidoDrawerProps> = ({
  open,
  onClose,
  preloadedClientData,
  preloadedClientId,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "100%",
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box sx={{ p: 2.5, pb: 0 }}>
          <Box sx={{ maxWidth: 1600, mx: "auto", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
              <IconButton size="small" onClick={onClose} aria-label="Fechar">
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
                Criar Novo Pedido
              </Typography>
              <Box sx={{ width: 32 }} />
            </Box>
            <Divider sx={{ mb: 3 }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
          <Box sx={{ maxWidth: 1600, mx: "auto", width: "100%" }}>
            <EntregaForm
              embedded
              onClose={onClose}
              preloadedClientData={preloadedClientData}
              preloadedClientId={preloadedClientId}
            />
          </Box>
        </Box>
      </Stack>
    </Drawer>
  );
};

export default NovoPedidoDrawer;
