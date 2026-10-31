import type { ReactNode } from "react";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";

import { COLORS } from "@/shared/theme/colors";
interface ActionIconButtonProps {
  title: string;
  icon: ReactNode;
  color: string;
  hoverColor: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ActionIconButton = ({
  title,
  icon,
  color,
  hoverColor,
  onClick,
  disabled = false,
  loading = false,
}: ActionIconButtonProps) => (
  <Tooltip title={title}>
    <IconButton
      size="small"
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      sx={{
        bgcolor: color,
        borderRadius: 1.5,
        "&:hover": { bgcolor: hoverColor },
      }}
    >
      {loading ? (
        <CircularProgress size={14} sx={{ color: COLORS.white }} />
      ) : (
        icon
      )}
    </IconButton>
  </Tooltip>
);

export default ActionIconButton;
