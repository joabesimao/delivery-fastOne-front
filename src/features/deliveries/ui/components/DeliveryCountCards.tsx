import { CircularProgress, Grid, Typography } from "@mui/material";
import { COLORS } from "@/shared/theme/colors";
import BorderedCard from "@/shared/ui/layout/BorderedCard";

interface DeliveryCountCardsProps {
  loading: boolean;
  total: number;
  active: number;
}

const DeliveryCountCards = ({
  loading,
  total,
  active,
}: DeliveryCountCardsProps) => {
  const cards = [
    {
      label: "Total de pedidos",
      value: total,
      caption: "considerando todos os status",
      color: undefined,
    },
    {
      label: "Pedidos em andamento",
      value: active,
      caption: "aguardando ou em trânsito",
      color: COLORS.warning,
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6 }}>
          <BorderedCard sx={{ p: 2.25 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              {card.label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, mt: 0.5, color: card.color }}
            >
              {loading ? <CircularProgress size={22} /> : card.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {card.caption}
            </Typography>
          </BorderedCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default DeliveryCountCards;
