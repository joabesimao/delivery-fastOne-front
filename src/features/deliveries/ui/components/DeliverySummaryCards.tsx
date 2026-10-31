import type { ReactNode } from "react";
import { Box, Chip, Grid, Typography } from "@mui/material";
import { phoneMask } from "@/shared/lib/masks";
import { deliveryStreetLine, type Delivery } from "../../domain/delivery";
import FinishStatusChip from "./FinishStatusChip";

const SummaryCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
      }}
    >
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          color: "#9CA3AF",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  </Grid>
);

const Primary = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="body2"
    fontWeight={600}
    sx={{ mt: 0.5, color: "text.primary" }}
  >
    {children}
  </Typography>
);

const Secondary = ({ children }: { children: ReactNode }) => (
  <Typography variant="body2" color="text.secondary">
    {children}
  </Typography>
);

const DeliverySummaryCards = ({ delivery }: { delivery: Delivery }) => {
  const { client, address, deliveryman } = delivery;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Chip
          label={`Pedido #${delivery.id}`}
          size="small"
          sx={{
            bgcolor: "#E8ECFF",
            color: "#4361EE",
            fontWeight: 700,
            border: "1px solid #C7D2FE",
          }}
        />
        <FinishStatusChip status={delivery.status} />
        <Typography variant="caption" color="text.secondary">
          {new Date(delivery.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <SummaryCard title="Cliente">
          <Primary>{client.name}</Primary>
          <Secondary>{phoneMask(client.phone)}</Secondary>
        </SummaryCard>
        <SummaryCard title="Entregador">
          <Primary>
            {deliveryman
              ? `${deliveryman.name} ${deliveryman.lastName}`
              : "Não vinculado"}
          </Primary>
          {deliveryman?.phone && (
            <Secondary>{phoneMask(deliveryman.phone)}</Secondary>
          )}
        </SummaryCard>
        <SummaryCard title="Endereço">
          <Primary>{deliveryStreetLine(address)}</Primary>
          <Secondary>
            {address.neighborhood} — {address.city}
          </Secondary>
          {address.reference && (
            <Typography variant="caption" color="text.secondary">
              Ref: {address.reference}
            </Typography>
          )}
        </SummaryCard>
      </Grid>
    </Box>
  );
};

export default DeliverySummaryCards;
