import type { ReactNode } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { formatCurrency } from "@/shared/lib/format/currency";

interface ProductStatCardsProps {
  loading: boolean;
  total: number;
  categories: number;
  lowStock: number;
  averagePrice: number;
}

interface StatConfig {
  label: string;
  value: ReactNode;
  caption: string;
  color: string;
  icon: ReactNode;
}

const ProductStatCards = ({
  loading,
  total,
  categories,
  lowStock,
  averagePrice,
}: ProductStatCardsProps) => {
  const stats: StatConfig[] = [
    {
      label: "Total de Produtos Ativos",
      value: loading ? <CircularProgress size={22} /> : total,
      caption: "em catálogo",
      color: "#0EA5E9",
      icon: <Inventory2RoundedIcon fontSize="small" />,
    },
    {
      label: "Categorias Ativas",
      value: categories,
      caption: "seções no catálogo",
      color: "#8B5CF6",
      icon: <CategoryRoundedIcon fontSize="small" />,
    },
    {
      label: "Itens com Baixo Estoque",
      value: lowStock,
      caption: "atenção requerida",
      color: "#F59E0B",
      icon: <WarningAmberRoundedIcon fontSize="small" />,
    },
    {
      label: "Preço Médio do Catálogo",
      value: formatCurrency(averagePrice),
      caption: "por item cadastrado",
      color: "#10B981",
      icon: <SellRoundedIcon fontSize="small" />,
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat) => (
        <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
              p: 2.25,
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                {stat.label}
              </Typography>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(stat.color, 0.14),
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stat.caption}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductStatCards;
