import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { DeliveryStatus } from "../../domain/delivery";

import { COLORS } from "@/shared/theme/colors";
const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string }> =
  {
    actived: { label: "Aguardando aceite", color: COLORS.warning },
    delivered: { label: "Em Trânsito", color: COLORS.info },
    finished: { label: "Entregue", color: COLORS.success },
  };

const DeliveryStatusChip = ({ status }: { status: DeliveryStatus }) => {
  const { label, color } = STATUS_CONFIG[status];
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 700 }}
    />
  );
};

export default DeliveryStatusChip;
