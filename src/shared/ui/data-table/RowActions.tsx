import { Box, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { ReactNode } from "react";
import ActionIconButton from "./ActionIconButton";

import { COLORS } from "@/shared/theme/colors";
interface RowActionsProps {
  onEdit: () => void;
  onDelete?: () => void;
  onView?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

const WHITE_ICON = { fontSize: 16, color: COLORS.white };

const RowActions = ({
  onEdit,
  onDelete,
  onView,
  disabled = false,
  children,
}: RowActionsProps) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Box display="flex" gap={0.5}>
      {onView && (
        <ActionIconButton
          title="Visualizar"
          disabled={disabled}
          onClick={onView}
          color={isDark ? "#374151" : "#e5e7eb"}
          hoverColor={isDark ? "#4b5563" : "#d1d5db"}
          icon={
            <VisibilityIcon
              sx={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280" }}
            />
          }
        />
      )}
      <ActionIconButton
        title="Editar"
        disabled={disabled}
        onClick={onEdit}
        color={COLORS.warning}
        hoverColor={COLORS.warningHover}
        icon={<EditIcon sx={WHITE_ICON} />}
      />
      {onDelete && (
        <ActionIconButton
          title="Deletar"
          disabled={disabled}
          onClick={onDelete}
          color={COLORS.danger}
          hoverColor={COLORS.dangerHover}
          icon={<DeleteIcon sx={WHITE_ICON} />}
        />
      )}
      {children}
    </Box>
  );
};

export default RowActions;
