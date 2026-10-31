import { useMemo, useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { UserMenu } from "@/features/auth";
import { FloatingChatWidget } from "@/features/chat";
import { NotificationBell, useNotifications } from "@/features/notifications";
import { GlobalSearch } from "@/features/search";
import { ROUTES } from "@/shared/config/routes";
import { session } from "@/shared/session/session";
import useThemeMode from "@/shared/theme/useThemeMode";
import { buildNavItems } from "./navigation/navItems";
import SideNav from "./SideNav";

const DRAWER_WIDTH = 272;

const AppShell = ({ children }: { children?: ReactNode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { mode, toggleMode } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionUser] = useState(session.getUser);
  const { chatUnreadCount } = useNotifications();

  const navItems = useMemo(
    () => buildNavItems(sessionUser.role, chatUnreadCount),
    [sessionUser.role, chatUnreadCount],
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 1.5, sm: 3 }, gap: 1.25 }}>
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
            sx={{ display: { md: "none" } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <GlobalSearch />

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />

          <Stack direction="row" spacing={0.25} alignItems="center">
            <Tooltip title="Atualizar">
              <IconButton>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
            <NotificationBell canSendNotice={sessionUser.role === "admin"} />
            <Tooltip title="Configurações">
              <IconButton onClick={() => navigate(ROUTES.visualSettings)}>
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
              }
            >
              <IconButton onClick={toggleMode}>
                {mode === "dark" ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <UserMenu user={sessionUser} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <SideNav
          items={navItems}
          pathname={pathname}
          onNavigate={handleNavigate}
        />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: "88px",
          px: { xs: 1.5, sm: 3 },
          pb: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: "auto", width: "100%" }}>
          {children ?? <Outlet />}
        </Box>
      </Box>

      <FloatingChatWidget />
    </Box>
  );
};

export default AppShell;
