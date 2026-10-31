import { Chip, type SxProps, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { StockInfo } from "../../domain/productCatalog";
import { STOCK_COLOR } from "./categoryStyle";

export const StockChip = ({
  stock,
  sx,
  opacity = 0.14,
}: {
  stock: StockInfo;
  sx?: SxProps<Theme>;
  opacity?: number;
}) => (
  <Chip
    label={stock.label}
    size="small"
    sx={[
      {
        fontWeight: 700,
        bgcolor: alpha(STOCK_COLOR[stock.status], opacity),
        color: STOCK_COLOR[stock.status],
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

export const ProductActiveChip = ({
  active,
  sx,
}: {
  active: boolean;
  sx?: SxProps<Theme>;
}) => (
  <Chip
    label={active ? "Ativo" : "Inativo"}
    size="small"
    sx={[
      {
        fontWeight: 700,
        bgcolor: active ? alpha("#10B981", 0.14) : alpha("#94A3B8", 0.18),
        color: active ? "#10B981" : "#64748B",
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
