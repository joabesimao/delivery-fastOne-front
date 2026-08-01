import { useEffect, useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  AppBar,
  Avatar,
  Box,
  ButtonBase,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import useThemeMode from "../../hooks/useThemeMode";
import { closeRealtimeSocket } from "../../services/realtime";
import FloatingChatWidget from "../chat/FloatingChatWidget";

type NavigationGroup = {
  label: string;
  icon: ReactNode;
  children: Array<{
    label: string;
    path: string;
    icon: ReactNode;
  }>;
};

const drawerWidth = 292;

const navigationGroups: NavigationGroup[] = [
  {
    label: "Dashboard",
    icon: <DashboardOutlinedIcon fontSize="small" />,
    children: [
      { label: "Visão geral", path: "/dashboard", icon: <InsightsOutlinedIcon fontSize="small" /> },
      { label: "Relatórios", path: "/dashboard/relatorios", icon: <ListAltOutlinedIcon fontSize="small" /> },
      { label: "Clientes", path: "/dashboard/clientes", icon: <PersonAddAltOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Entregas",
    icon: <LocalShippingOutlinedIcon fontSize="small" />,
    children: [
      { label: "Realizar entrega", path: "/realizar-entrega", icon: <LocalShippingOutlinedIcon fontSize="small" /> },
      { label: "Finalizar entrega", path: "/finalizar-entrega", icon: <InsightsOutlinedIcon fontSize="small" /> },
      { label: "Listagem de entregas", path: "/listagem-entregas", icon: <ListAltOutlinedIcon fontSize="small" /> },
      { label: "Relatórios", path: "/relatorios-entregas", icon: <ListAltOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Cadastros",
    icon: <AssignmentIndOutlinedIcon fontSize="small" />,
    children: [
      { label: "Cadastrar cliente", path: "/cadastros/cliente", icon: <PersonAddAltOutlinedIcon fontSize="small" /> },
      { label: "Cadastrar entregador", path: "/cadastros/entregador", icon: <TwoWheelerOutlinedIcon fontSize="small" /> },
      { label: "Cadastrar bairros", path: "/cadastros/bairros", icon: <PlaceOutlinedIcon fontSize="small" /> },
      { label: "Cadastrar cidades", path: "/cadastros/cidades", icon: <LocationCityOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Configurações",
    icon: <SettingsOutlinedIcon fontSize="small" />,
    children: [
      { label: "Configurações visuais", path: "/configuracoes/visuais", icon: <PaletteOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Comunicação",
    icon: <ChatOutlinedIcon fontSize="small" />,
    children: [
      { label: "Chat entre lojas", path: "/chat", icon: <ChatOutlinedIcon fontSize="small" /> },
    ],
  },
];

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/relatorios": "Relatórios do Dashboard",
  "/dashboard/clientes": "Clientes",
  "/realizar-entrega": "Realizar entrega",
  "/finalizar-entrega": "Finalizar entrega",
  "/listagem-entregas": "Listagem de entregas",
  "/relatorios-entregas": "Relatórios de entregas",
  "/cadastros/cliente": "Cadastrar cliente",
  "/cadastros/entregador": "Cadastrar entregador",
  "/cadastros/bairros": "Cadastrar bairros",
  "/cadastros/cidades": "Cadastrar cidades",
  "/configuracoes/visuais": "Configurações visuais",
  "/chat": "Chat entre lojas",
};

const routeDescriptions: Record<string, string> = {
  "/dashboard": "Acompanhe atalhos, visões gerais e ações rápidas.",
  "/dashboard/relatorios": "Visualize indicadores e distribuição das entregas.",
  "/dashboard/clientes": "Gerencie cadastro, busca e status dos clientes.",
  "/realizar-entrega": "Fluxo operacional para gerar uma nova entrega.",
  "/finalizar-entrega": "Atualize entregas e conclua os processos pendentes.",
  "/listagem-entregas": "Acompanhe as entregas com filtros por status, entregador e local.",
  "/relatorios-entregas": "Analise o volume e o desempenho das entregas.",
  "/cadastros/cliente": "Cadastre e atualize informações de clientes.",
  "/cadastros/entregador": "Mantenha entregadores e condutores organizados.",
  "/cadastros/bairros": "Gerencie bairros usados nos endereços.",
  "/cadastros/cidades": "Organize as cidades disponíveis no sistema.",
  "/configuracoes/visuais": "Personalize aparência e comportamento visual.",
  "/chat": "Converse com matriz e filiais em tempo real.",
};

const getAvatarLabel = (email: string) => email.trim().charAt(0).toUpperCase() || "U";

const AppShell = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { mode, toggleMode } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(navigationGroups[0]?.label ?? null);

  const currentEmail = typeof window !== "undefined" ? localStorage.getItem("currentUserEmail") ?? "" : "";
  const currentTitle = routeTitles[location.pathname] ?? "FastOne Delivery";
  const currentDescription = routeDescriptions[location.pathname] ?? "Visual moderno, responsivo e consistente em toda a aplicação.";

  useEffect(() => {
    const activeGroup = navigationGroups.find((group) =>
      group.children.some((child) => child.path === location.pathname),
    );

    if (activeGroup) {
      setOpenGroup(activeGroup.label);
    }

    if (!isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop, location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    closeRealtimeSocket();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUserEmail");
    setProfileAnchorEl(null);
    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack spacing={2} sx={{ p: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 2,
            }}
          >
            <LocalShippingOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
              FastOne Delivery
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Operations dashboard
            </Typography>
          </Box>
        </Stack>

        <Chip label={mode === "dark" ? "Dark mode" : "Light mode"} size="small" variant="outlined" sx={{ width: "fit-content" }} />
      </Stack>

      <Divider />

      <Box sx={{ p: 1.5, overflowY: "auto", flex: 1 }}>
        <List disablePadding>
          {navigationGroups.map((group) => {
            const isOpen = openGroup === group.label;
            return (
              <Box key={group.label} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: "text.primary",
                    bgcolor: isOpen ? (currentTheme) => alpha(currentTheme.palette.primary.main, 0.08) : "transparent",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    {group.icon}
                  </ListItemIcon>
                  <ListItemText primary={group.label} primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }} />
                  {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </ListItemButton>

                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 1.5 }}>
                    {group.children.map((item) => {
                      const isActive = location.pathname === item.path;

                      return (
                        <ListItemButton
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          selected={isActive}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            pl: 2,
                            py: 1,
                            color: isActive ? "primary.main" : "text.secondary",
                            bgcolor: isActive ? (currentTheme) => alpha(currentTheme.palette.primary.main, 0.1) : "transparent",
                            "&:hover": {
                              bgcolor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 650, fontSize: 13.5 }} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage: (currentTheme) =>
          currentTheme.palette.mode === "light"
            ? `radial-gradient(circle at top left, ${alpha(currentTheme.palette.primary.main, 0.12)} 0, transparent 28%), radial-gradient(circle at 100% 0%, ${alpha(currentTheme.palette.secondary.main, 0.1)} 0, transparent 24%)`
            : "none",
      }}
    >
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (currentTheme) => currentTheme.zIndex.drawer + 1,
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 }, gap: 2 }}>
          {!isDesktop ? (
            <IconButton onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <MenuRoundedIcon />
            </IconButton>
          ) : null}

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
              FastOne Delivery
            </Typography>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }} noWrap>
              {currentTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {currentDescription}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
              <IconButton onClick={toggleMode} aria-label="Alternar tema">
                {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notificações">
              <IconButton aria-label="Notificações">
                <NotificationsNoneOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <ButtonBase
            onClick={(event) => setProfileAnchorEl(event.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              pl: 1,
              pr: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: 1,
              borderColor: "divider",
              bgcolor: (currentTheme) =>
                alpha(currentTheme.palette.background.paper, currentTheme.palette.mode === "dark" ? 0.4 : 0.8),
            }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>
              {getAvatarLabel(currentEmail)}
            </Avatar>
            <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }} noWrap>
                {currentEmail || "Usuário"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Administrador
              </Typography>
            </Box>
          </ButtonBase>

          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={() => setProfileAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Stack spacing={5}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {currentEmail || "Usuário"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Conta ativa
                </Typography>
              </Stack>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop || mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: "88px",
          px: { xs: 2, sm: 3, },
          pb: { xs: 3, md: 4 },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Box
          sx={{
            maxWidth: 1480,
            mx: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            "& > *": {
              width: "100%",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <FloatingChatWidget />
    </Box>
  );
};

export default AppShell;