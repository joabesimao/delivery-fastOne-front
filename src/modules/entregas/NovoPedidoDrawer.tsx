import React from "react";
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: fullScreen ? "100%" : 480,
          maxWidth: "100%",
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Criar Novo Pedido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preencha os dados para criar um novo pedido de entrega
              </Typography>
            </Box>
            <IconButton onClick={onClose} aria-label="Fechar" size="small">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ mt: 2, p: 1.25, borderRadius: 2.5, bgcolor: (t) => t.palette.action.hover }}
          >
            <StoreRoundedIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                Ponto de coleta
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                Matriz Central - SP
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
          <EntregaForm
            embedded
            onClose={onClose}
            preloadedClientData={preloadedClientData}
            preloadedClientId={preloadedClientId}
          />
        </Box>
      </Stack>
    </Drawer>
  );
};

export default NovoPedidoDrawer;
