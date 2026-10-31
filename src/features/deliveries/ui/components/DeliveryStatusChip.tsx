import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { DeliveryStatus } from "../../domain/delivery";

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string }> =
  {
    actived: { label: "Aguardando aceite", color: "#F59E0B" },
    delivered: { label: "Em Trânsito", color: "#0EA5E9" },
    finished: { label: "Entregue", color: "#10B981" },
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
