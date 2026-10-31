import {
  Box,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { formatCurrency } from "@/shared/lib/format/currency";
import {
  initialsOf,
  type DeliverymanPerformance,
} from "../../domain/deliveryReport";

const CARD_SX = {
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  height: "100%",
};

const Counter = ({ value, label }: { value: number; label: string }) => (
  <Grid size={{ xs: 4 }}>
    <Card sx={{ p: 1.2, borderRadius: 2, border: 1, borderColor: "divider" }}>
      <Typography
        variant="h6"
        sx={{ textAlign: "center", fontWeight: 800, lineHeight: 1.1 }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center" }}
      >
        {label}
      </Typography>
    </Card>
  </Grid>
);

export const DeliverymanPerformanceSkeleton = () => (
  <Card sx={CARD_SX}>
    <Stack spacing={1.5} sx={{ p: 2.2 }}>
      <Skeleton variant="text" width={140} />
      <Skeleton variant="text" width={90} />
      <Skeleton variant="rounded" height={6} />
      <Grid container spacing={1}>
        {[0, 1, 2].map((index) => (
          <Grid key={index} size={{ xs: 4 }}>
            <Skeleton variant="rounded" height={50} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="text" width={120} />
    </Stack>
  </Card>
);

const DeliverymanPerformanceCard = ({
  item,
}: {
  item: DeliverymanPerformance;
}) => (
  <Card sx={CARD_SX}>
    <Stack spacing={1.4} sx={{ p: 2.2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Chip
            label={initialsOf(item.name)}
            size="small"
            sx={{ fontWeight: 700 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.1 }}
            >
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.phone}
            </Typography>
          </Box>
        </Stack>
        {item.completionRate === 100 && (
          <StarBorderIcon sx={{ fontSize: 16, color: "warning.main" }} />
        )}
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Taxa de conclusao
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {item.completionRate}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={item.completionRate}
        sx={{
          height: 5,
          borderRadius: 99,
          bgcolor: "action.hover",
          "& .MuiLinearProgress-bar": { borderRadius: 99 },
        }}
      />

      <Grid container spacing={1}>
        <Counter value={item.total} label="Total" />
        <Counter value={item.finished} label="Concluidos" />
        <Counter value={item.active} label="Ativas" />
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Receita gerada
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {formatCurrency(item.revenue)}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

export default DeliverymanPerformanceCard;
