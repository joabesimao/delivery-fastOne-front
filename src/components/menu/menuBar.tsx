import { useState, useRef, useCallback } from "react";
import {
  Box,
  Toolbar,
  Stack,
  Tooltip,
  Avatar,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Badge,
} from "@mui/material";
import MenuVertical from "./MenuVertical";
import { darken, useTheme } from "@mui/material/styles";
import CustomAppBar from "./components/CustomAppBar";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/hooks/globalState/auth/useAuth";
import { useMenu } from "../../hooks/globalState/menu/useMenu";
import { useTitle } from "@/hooks/globalState/titleHeader/useTitle";
import { useLogout } from "../../hooks/authentication/useLogout";
import { useNavigate } from "react-router-dom";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ModalGeneric from "@/components/modalConfirm";
import ProfileModal from "./components/ProfileModal";
import SelectComponent from "@components/SelectComponent";
import { RoleEnum } from "@/hooks/globalState/auth/roles";
import { getFirstName } from "@/helpers/getFirstName";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationPopper from "@/components/menu/components/Notes/NotificationPopper";
import useNotificationCount from "@/hooks/globalState/notification/useNotificationCount";

const drawerWidth = 250;

const MenuBar = () => {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const profileUser = useAuth((s) => s.profileUser);
  const setProfileUser = useAuth((s) => s.setProfileUser);
  const [profileUserLocal, setProfileUserLocal] = useState<{
    roleId: number;
    roleName: string;
    slug: RoleEnum;
    is_root?: boolean;
  } | null>(profileUser as any);
  const logout = useLogout();
  const menuTitle = useTitle((state) => state.menuTitle);
  const isMenuExpanded = useMenu((state) => state.isMenuExpanded);
  const [openModalSelectProfile, setOpenModalSelectProfile] =
    useState<boolean>(false);
  const navigateRouter = useNavigate();

  const [openNotifications, setOpenNotifications] = useState(false);
  const notificationAnchorRef = useRef<HTMLButtonElement>(null);

  const unreadCount = useNotificationCount((s) => s.unreadCount);

  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false);

  const handleCloseOrOpenProfileModal = useCallback(() => {
    setOpenProfileModal((prev) => !prev);
  }, []);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      console.error("Erro ao sair");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("unit_id");
      navigateRouter("/login");
      setTimeout(() => {
        useAuth.getState().resetAuth();
        useTitle.getState().setMenuTitle("");
      }, 0);
    }
  };

  const handleToggleNotifications = () => {
    setOpenNotifications((prev) => !prev);
  };

  const handleCloseNotifications = () => {
    setOpenNotifications(false);
  };

  return (
    <>
      <CustomAppBar
        position="fixed"
        sx={{
          height: "75px",
          bgcolor: "#fff",
          zIndex: theme.zIndex.appBar,
          marginLeft: isMenuExpanded
            ? `${drawerWidth}px`
            : `calc(${theme.spacing(7)} + 1px)`,
          width: isMenuExpanded
            ? `calc(100% - ${drawerWidth}px)`
            : `calc(100% - ${theme.spacing(7)} - 1px)`,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          [theme.breakpoints.up("sm")]: {
            marginLeft: isMenuExpanded
              ? `${drawerWidth}px`
              : `calc(${theme.spacing(8)} + 1px)`,
            width: isMenuExpanded
              ? `calc(100% - ${drawerWidth}px)`
              : `calc(100% - ${theme.spacing(8)} - 1px)`,
          },
          [theme.breakpoints.down("sm")]: {
            marginLeft: 0,
            width: "100%",
          },
        }}
        open={isMenuExpanded}
        drawerWidth={drawerWidth}
      >
        <Stack
          sx={{
            height: "100%",
            pl: { xs: "10px", sm: "30px" },
            pr: { xs: "10px", sm: "30px" },
            justifyContent: "center",
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Stack
                sx={{
                  pl: "5px",
                  mr: "5px",
                }}
                textAlign="center"
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: 600,
                    color: "#181C32",
                  }}
                >
                  {menuTitle}
                </Typography>
              </Stack>
            </Box>
            <Stack
              direction="row"
              gap={{
                xs: 0,
                sm: 1,
              }}
              alignItems="center"
            >
              <Tooltip title="Notificações">
                <IconButton
                  ref={notificationAnchorRef}
                  onClick={handleToggleNotifications}
                  sx={{
                    borderRadius: { xs: "8px", sm: "12px" },
                    width: { xs: "30px", sm: "40px" },
                    height: { xs: "30px", sm: "40px" },
                    bgcolor: "#E6E6E6",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      bgcolor: darken("#E6E6E6", 0.1),
                    },
                  }}
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.6rem",
                        height: "15px",
                        minWidth: "15px",
                        top: "-3px",
                        right: "-3px",
                      },
                    }}
                  >
                    <NotificationsIcon
                      sx={{ fontSize: { xs: "22px", sm: "27px" } }}
                    />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Click para editar perfil">
                <Stack sx={{ p: { xs: "5px", sm: "12px" } }}>
                  <Avatar
                    alt="Usuário"
                    onClick={handleCloseOrOpenProfileModal}
                    src={user?.profilePath || ""}
                    sx={{
                      width: { xs: "30px", sm: "40px" },
                      height: { xs: "30px", sm: "40px" },
                      bgcolor: "#07A7DF",
                      cursor: "pointer",
                    }}
                  />
                </Stack>
              </Tooltip>
              <Select
                displayEmpty
                size="small"
                value={1}
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    width: { xs: "40px", sm: "100px" },
                  },
                }}
              >
                <MenuItem value={1}>
                  <Typography variant="body2" fontWeight="600">
                    {user?.name ? getFirstName(user?.name) : "Usuário"}
                  </Typography>
                </MenuItem>
                <MenuItem
                  value={2}
                  onClick={() => setOpenModalSelectProfile(true)}
                >
                  <Stack direction="row" gap={1} alignItems="center">
                    <SyncAltIcon sx={{ color: "#757575" }} fontSize="small" />
                    <Typography variant="body2" fontWeight="600">
                      Alterar perfil
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value={3} onClick={() => handleLogout()}>
                  <Stack direction="row" gap={1} alignItems="center">
                    <LogoutIcon sx={{ color: "#757575" }} fontSize="small" />
                    <Typography variant="body2" fontWeight="600">
                      Sair
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </Stack>
          </Toolbar>
        </Stack>
      </CustomAppBar>
      <MenuVertical open={isMenuExpanded} drawerWidth={drawerWidth} />
      <NotificationPopper
        open={openNotifications}
        anchorEl={notificationAnchorRef.current}
        onClose={handleCloseNotifications}
      />
      <ModalGeneric
        open={openModalSelectProfile}
        handleClose={() => setOpenModalSelectProfile(false)}
        title="Selecione um perfil"
        handleConfirm={() => {
          setProfileUser(profileUserLocal as any);
          const landing = useAuth.getState().getDefaultLanding?.();
          if (landing) {
            useTitle.getState().setMenuTitle(landing.title);
            navigateRouter(landing.path);
          }
          setOpenModalSelectProfile(false);
        }}
        children={
          <SelectComponent
            name="change-profile"
            label=""
            placeholder="Selecione um perfil"
            options={(user?.userRole || []).map((ur) => ({
              value: ur.role?.id ?? "",
              label: `${ur.role?.name ?? "Perfil"}`,
            }))}
            value={profileUserLocal?.roleId ?? ""}
            onChange={(e) => {
              const newRoleId = Number(e.target.value);
              const match = (user?.userRole || []).find(
                (ur) => ur.role?.id === newRoleId,
              );
              const roleName = match?.role?.name ?? "";
              const slug = match?.role?.slug as any;
              const is_root = match?.role?.is_root ?? false;
              setProfileUserLocal({
                roleId: newRoleId,
                roleName,
                slug,
                is_root,
              });
            }}
          />
        }
      />
      <ProfileModal
        open={openProfileModal}
        onClose={handleCloseOrOpenProfileModal}
        user={user}
        profileUser={profileUser}
        setUser={setUser}
      />
    </>
  );
};
export default MenuBar;
