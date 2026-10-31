import { alpha } from "@mui/material/styles";
import type { DeliveryStatus } from "@/features/deliveries";

import { COLORS } from "@/shared/theme/colors";
export const LIVE_STATUS: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string }
> = {
  delivered: {
    label: "Em Trânsito",
    color: COLORS.info,
    bg: alpha(COLORS.info, 0.12),
  },
  actived: {
    label: "Aguardando aceite",
    color: COLORS.warning,
    bg: alpha(COLORS.warning, 0.14),
  },
  finished: {
    label: "Entregue",
    color: COLORS.success,
    bg: alpha(COLORS.success, 0.14),
  },
};
