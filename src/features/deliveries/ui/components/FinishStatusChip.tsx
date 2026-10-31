import { Chip } from "@mui/material";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";
import type { DeliveryStatus } from "../../domain/delivery";
import { FINISH_STATUS_COLOR, FINISH_STATUS_LABEL } from "./finishStatus";

interface FinishStatusChipProps {
  status: DeliveryStatus;
  compact?: boolean;
}

const FinishStatusChip = ({
  status,
  compact = false,
}: FinishStatusChipProps) => {
  const { isDark } = useSurfaceColors();
  const color = FINISH_STATUS_COLOR[status];
  return (
    <Chip
      label={FINISH_STATUS_LABEL[status]}
      size="small"
      sx={{
        bgcolor: isDark ? color.darkBg : color.bg,
        color: isDark ? color.darkText : color.text,
        fontWeight: 600,
        border: `1px solid ${color.border}`,
        ...(compact && { fontSize: 11, height: 22 }),
      }}
    />
  );
};

export default FinishStatusChip;
