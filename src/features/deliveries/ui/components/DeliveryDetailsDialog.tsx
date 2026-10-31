import type { ReactNode } from "react";
import {
  Box,
  Button,
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { formatDateTime } from "@/shared/lib/date/formatDate";
import { formatCurrency } from "@/shared/lib/format/currency";
import { phoneMask } from "@/shared/lib/masks";
import InfoField from "@/shared/ui/InfoField";
import {
  deliveryDeliverymanName,
  deliveryStreetLine,
  isFinishedDelivery,
  type Delivery,
} from "../../domain/delivery";
import DeliveryStatusChip from "./DeliveryStatusChip";

interface DeliveryDetailsDialogProps {
  delivery: Delivery | null;
  onClose: () => void;
  onFinish: (delivery: Delivery) => void;
}

interface DetailField {
  label: string;
  value: string;
  size: { xs: number; sm: number };
}

const half = { xs: 12, sm: 6 };
const full = { xs: 12, sm: 12 };
const third = { xs: 6, sm: 4 };

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const FieldGrid = ({ fields }: { fields: DetailField[] }) => (
  <Grid container spacing={2}>
    {fields.map((field) => (
      <Grid key={field.label} size={field.size}>
        <InfoField label={field.label} value={field.value} />
      </Grid>
    ))}
  </Grid>
);

const maskedPhone = (phone: string) => (phone ? phoneMask(phone) : "-");

const DeliveryDetailsDialog = ({
  delivery,
  onClose,
  onFinish,
}: DeliveryDetailsDialogProps) => (
  <Dialog open={Boolean(delivery)} onClose={onClose} fullWidth maxWidth="sm">
    {delivery && (
      <>
        <DialogTitle sx={{ pr: 6 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Pedido #{delivery.id}
            </Typography>
            <DeliveryStatusChip status={delivery.status} />
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
            <FieldGrid
              fields={[
                { label: "Nome", value: delivery.client.name, size: half },
                {
                  label: "Telefone",
                  value: maskedPhone(delivery.client.phone),
                  size: half,
                },
              ]}
            />
          </Section>

          <Divider sx={{ my: 2 }} />

          <Section title="Endereço de entrega">
            <FieldGrid
              fields={[
                {
                  label: "Endereço",
                  value: deliveryStreetLine(delivery.address),
                  size: half,
                },
                {
                  label: "Bairro / Cidade",
                  value: `${delivery.address.neighborhood} - ${delivery.address.city}`,
                  size: half,
                },
                {
                  label: "Referência",
                  value: delivery.address.reference || "Sem referência",
                  size: full,
                },
              ]}
            />
          </Section>

          <Divider sx={{ my: 2 }} />

          <Section title="Pedido">
            <FieldGrid
              fields={[
                { label: "Quantidade", value: delivery.quantity, size: third },
                {
                  label: "Valor",
                  value: formatCurrency(delivery.amount),
                  size: third,
                },
                {
                  label: "Filial",
                  value: delivery.unitStoreName ?? "-",
                  size: { xs: 12, sm: 4 },
                },
                {
                  label: "Entregador",
                  value: delivery.deliveryman
                    ? deliveryDeliverymanName(delivery.deliveryman)
                    : "Não atribuído",
                  size: half,
                },
                {
                  label: "Telefone do entregador",
                  value: maskedPhone(delivery.deliveryman?.phone ?? ""),
                  size: half,
                },
                {
                  label: "Recebido em",
                  value: formatDateTime(
                    delivery.receivedAt ?? delivery.createdAt,
                  ),
                  size: half,
                },
                {
                  label: "Finalizado em",
                  value: formatDateTime(delivery.finishedAt),
                  size: half,
                },
              ]}
            />
          </Section>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Fechar
          </Button>
          {!isFinishedDelivery(delivery) && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon fontSize="small" />}
              onClick={() => onFinish(delivery)}
              sx={{ textTransform: "none" }}
            >
              Finalizar entrega
            </Button>
          )}
        </DialogActions>
      </>
    )}
  </Dialog>
);

export default DeliveryDetailsDialog;
