import React from "react";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { phoneMask } from "../../helpers/masks";

type OrderStatus = "actived" | "delivered" | "finished";

export interface OrderDetail {
  id: number;
  quantity: string;
  amount: number;
  data: string;
  receivedAt?: string;
  finishedAt?: string;
  status: OrderStatus;
  unitStore?: {
    name: string;
  } | null;
  deliveryman?: {
    id: number;
    name: string;
    lastName: string;
    phone?: string;
  } | null;
  Register: {
    client: {
      name: string;
      phone?: string;
    };
    address: {
      street: string;
      numberHouse: number;
      neighborhood: string;
      city: string;
      reference?: string | null;
    };
  };
}

interface DetalhesEntregaDialogProps {
  order: OrderDetail | null;
  statusConfig: Record<OrderStatus, { label: string; color: string }>;
  onClose: () => void;
  onFinish?: (order: OrderDetail) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DetalhesEntregaDialog: React.FC<DetalhesEntregaDialogProps> = ({
  order,
  statusConfig,
  onClose,
  onFinish,
}) => {
  const status = order ? statusConfig[order.status] : null;

  return (
    <Dialog open={Boolean(order)} onClose={onClose} fullWidth maxWidth="sm">
      {order && status ? (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Pedido #{order.id}
              </Typography>
              <Chip
                label={status.label}
                size="small"
                sx={{ bgcolor: alpha(status.color, 0.14), color: status.color, fontWeight: 700 }}
              />
            </Stack>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="fechar"
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Section title="Cliente">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info label="Nome" value={order.Register.client.name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info
                    label="Telefone"
                    value={order.Register.client.phone ? phoneMask(order.Register.client.phone) : "-"}
                  />
                </Grid>
              </Grid>
            </Section>

            <Divider sx={{ my: 2 }} />

            <Section title="Endereço de entrega">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info
                    label="Endereço"
                    value={`${order.Register.address.street}, ${order.Register.address.numberHouse}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info
                    label="Bairro / Cidade"
                    value={`${order.Register.address.neighborhood} - ${order.Register.address.city}`}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Info label="Referência" value={order.Register.address.reference || "Sem referência"} />
                </Grid>
              </Grid>
            </Section>

            <Divider sx={{ my: 2 }} />

            <Section title="Pedido">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Info label="Quantidade" value={order.quantity} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Info label="Valor" value={currencyFormatter.format(Number(order.amount))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Info label="Filial" value={order.unitStore?.name ?? "-"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info
                    label="Entregador"
                    value={
                      order.deliveryman
                        ? `${order.deliveryman.name} ${order.deliveryman.lastName}`.trim()
                        : "Não atribuído"
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info
                    label="Telefone do entregador"
                    value={order.deliveryman?.phone ? phoneMask(order.deliveryman.phone) : "-"}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info label="Recebido em" value={formatDateTime(order.receivedAt ?? order.data)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Info label="Finalizado em" value={formatDateTime(order.finishedAt)} />
                </Grid>
              </Grid>
            </Section>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
              Fechar
            </Button>
            {onFinish && order.status !== "finished" ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                onClick={() => onFinish(order)}
                sx={{ textTransform: "none" }}
              >
                Finalizar entrega
              </Button>
            ) : null}
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

export default DetalhesEntregaDialog;
