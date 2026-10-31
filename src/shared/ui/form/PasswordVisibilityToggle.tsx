import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

const PasswordVisibilityToggle = ({
  visible,
  onToggle,
}: PasswordVisibilityToggleProps) => {
  const title = visible ? "Ocultar senha" : "Mostrar senha";

  return (
    <InputAdornment position="end">
      <Tooltip title={title}>
        <IconButton
          onClick={onToggle}
          edge="end"
          size="small"
          aria-label={title}
        >
          {visible ? (
            <VisibilityOffOutlinedIcon fontSize="small" />
          ) : (
            <VisibilityOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );
};

export default PasswordVisibilityToggle;
