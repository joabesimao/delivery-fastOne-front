import { useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import type { SessionUser } from "@/shared/session/session";
import {
  avatarLabelOf,
  displayEmailOf,
  displayNameOf,
} from "../../domain/currentUser";
import { useLogout } from "../../application/useLogout";

const UserMenu = ({ user }: { user: SessionUser }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const logout = useLogout();
  const name = displayNameOf(user);

  return (
    <>
      <Tooltip title={name}>
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ ml: 0.25 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            {avatarLabelOf(name)}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, lineHeight: 1.15 }}
            noWrap
          >
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {displayEmailOf(user)}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            logout();
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
