import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import type { RankingPage } from "../../domain/deliverymanRanking";

interface RankingListProps {
  ranking: RankingPage;
  onPageChange: (page: number) => void;
}

const RankingList = ({ ranking, onPageChange }: RankingListProps) => (
  <>
    <Stack spacing={1.5}>
      <Alert severity="success" sx={{ mb: 1 }}>
        Total de entregas no período: <strong>{ranking.totalDeliveries}</strong>{" "}
        | Entregadores no filtro: <strong>{ranking.totalItems}</strong>
      </Alert>

      {ranking.items.map((item, index) => (
        <Card key={item.deliverymanId} sx={{ borderRadius: 2 }}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                #{index + 1}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {item.deliverymanName}
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {item.totalDeliveries}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>

    <Box
      sx={{
        mt: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Página {ranking.page} de {ranking.totalPages}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          disabled={ranking.page <= 1}
          onClick={() => onPageChange(ranking.page - 1)}
          sx={{ textTransform: "none" }}
        >
          Anterior
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={ranking.page >= ranking.totalPages}
          onClick={() => onPageChange(ranking.page + 1)}
          sx={{ textTransform: "none" }}
        >
          Próxima
        </Button>
      </Stack>
    </Box>
  </>
);

export default RankingList;
