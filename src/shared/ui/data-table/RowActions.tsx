import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  disabled?: boolean;
}

const actionSx = (color: string, hoverColor: string) => ({
  bgcolor: color,
  borderRadius: 1.5,
  "&:hover": { bgcolor: hoverColor },
});

const RowActions = ({
  onEdit,
  onDelete,
  onView,
  disabled = false,
}: RowActionsProps) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Box display="flex" gap={0.5}>
      {onView && (
        <Tooltip title="Visualizar">
          <IconButton
            size="small"
            disabled={disabled}
            onClick={onView}
            sx={
              isDark
                ? actionSx("#374151", "#4b5563")
                : actionSx("#e5e7eb", "#d1d5db")
            }
          >
            <VisibilityIcon
              sx={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280" }}
            />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Editar">
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onEdit}
          sx={actionSx("#f59e0b", "#d97706")}
        >
          <EditIcon sx={{ fontSize: 16, color: "#fff" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Deletar">
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onDelete}
          sx={actionSx("#ef4444", "#dc2626")}
        >
          <DeleteIcon sx={{ fontSize: 16, color: "#fff" }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default RowActions;
