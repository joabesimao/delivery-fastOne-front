import { alpha } from "@mui/material/styles";
import type { DeliveryStatus } from "@/features/deliveries";

export const LIVE_STATUS: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string }
> = {
  delivered: {
    label: "Em Trânsito",
    color: "#0EA5E9",
    bg: alpha("#0EA5E9", 0.12),
  },
  actived: {
    label: "Aguardando aceite",
    color: "#F59E0B",
    bg: alpha("#F59E0B", 0.14),
  },
  finished: { label: "Entregue", color: "#10B981", bg: alpha("#10B981", 0.14) },
};
