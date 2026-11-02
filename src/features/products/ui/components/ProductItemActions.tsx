import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

interface ProductItemActionsProps {
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductItemActions = ({
  busy,
  onEdit,
  onDelete,
}: ProductItemActionsProps) => (
  <>
    <Tooltip title="Editar">
      <IconButton size="small" onClick={onEdit} disabled={busy}>
        <EditRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Excluir">
      <IconButton size="small" onClick={onDelete} disabled={busy}>
        {busy ? (
          <CircularProgress size={16} />
        ) : (
          <DeleteRoundedIcon fontSize="small" color="error" />
        )}
      </IconButton>
    </Tooltip>
  </>
);

export default ProductItemActions;
