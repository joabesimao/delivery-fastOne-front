import { Chip, type SxProps, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { StockInfo } from "../../domain/productCatalog";
import { STOCK_COLOR } from "./categoryStyle";

import { COLORS } from "@/shared/theme/colors";
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
        bgcolor: active
          ? alpha(COLORS.success, 0.14)
          : alpha(COLORS.slate, 0.18),
        color: active ? COLORS.success : COLORS.slateStrong,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
