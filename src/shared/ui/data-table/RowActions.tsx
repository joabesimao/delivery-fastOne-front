import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
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
  disabled = false,
}: RowActionsProps) => (
  <Box display="flex" gap={0.5}>
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

export default RowActions;
