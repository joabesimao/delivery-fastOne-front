import {
  Avatar,
  Box,
  Button,
  Card,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { RankingItem } from "@/features/deliveries";
import { initialsOf } from "../../domain/dashboardMetrics";

import { COLORS } from "@/shared/theme/colors";
const MEDAL_COLORS = [COLORS.warning, COLORS.slate, "#B45309"];

interface TopDeliverymenCardProps {
  ranking: RankingItem[];
  loading: boolean;
  onViewAll: () => void;
}

const TopDeliverymenCard = ({
  ranking,
  loading,
  onViewAll,
}: TopDeliverymenCardProps) => (
  <Card
    sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}
  >
    <Stack spacing={1.75} sx={{ p: 2.5, height: "100%" }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Top Entregadores
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ranking no período selecionado
        </Typography>
      </Box>

      <Stack spacing={1.25} sx={{ flex: 1 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={62} />
          ))
        ) : ranking.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma entrega finalizada no período.
          </Typography>
        ) : (
          ranking.map((deliverer, index) => (
            <Stack
              key={deliverer.deliverymanId}
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{
                p: 1.25,
                borderRadius: 2.5,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: COLORS.white,
                  bgcolor: MEDAL_COLORS[index] ?? COLORS.slateStrong,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </Box>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "secondary.main",
                  fontSize: 13,
                }}
              >
                {initialsOf(deliverer.deliverymanName)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                  {deliverer.deliverymanName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  Entregador
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, lineHeight: 1 }}
                >
                  {deliverer.totalDeliveries}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  entregas
                </Typography>
              </Box>
            </Stack>
          ))
        )}
      </Stack>

      <Button
        fullWidth
        onClick={onViewAll}
        sx={{ fontWeight: 700, justifyContent: "space-between" }}
        endIcon={
          <AddRoundedIcon
            sx={{ transform: "rotate(45deg)" }}
            fontSize="small"
          />
        }
      >
        Ver classificação completa da frota
      </Button>
    </Stack>
  </Card>
);

export default TopDeliverymenCard;
