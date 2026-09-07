import { useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import useThemeMode from "../../hooks/useThemeMode";
import { closeRealtimeSocket } from "../../services/realtime";
import FloatingChatWidget from "../chat/FloatingChatWidget";

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number;
};

const drawerWidth = 272;

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Pedidos de Entrega", path: "/listagem-entregas", icon: <ListAltOutlinedIcon fontSize="small" /> },
  { label: "Finalizar Entregas", path: "/finalizar-entrega", icon: <CheckCircleOutlineIcon fontSize="small" /> },
  { label: "Clientes", path: "/dashboard/clientes", icon: <GroupOutlinedIcon fontSize="small" /> },
  { label: "Entregadores", path: "/listagem-entregadores", icon: <TwoWheelerOutlinedIcon fontSize="small" /> },
  { label: "Produtos", path: "/dashboard/produtos", icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { label: "Localidades", path: "/cadastros/cidades", icon: <PlaceOutlinedIcon fontSize="small" /> },
  { label: "Chat", path: "/chat", icon: <ChatOutlinedIcon fontSize="small" />, badge: 2 },
  { label: "Filiais", path: "/filiais", icon: <StoreOutlinedIcon fontSize="small" /> },
  { label: "Configurações", path: "/configuracoes/visuais", icon: <SettingsOutlinedIcon fontSize="small" /> },
];

const units = ["Matriz Central - SP", "Filial Guarulhos - SP", "Filial ABC - SP"];

const ADMIN_TECH_EMAIL = "admin@fastone.local";

const normalizeUserLabel = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized.toLowerCase() === ADMIN_TECH_EMAIL) return "Operador Admin";
  return normalized;
};

const getAvatarLabel = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";

const AppShell = ({ children }: { children?: ReactNode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { mode, toggleMode } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [unitAnchorEl, setUnitAnchorEl] = useState<HTMLElement | null>(null);
  const [activeUnit, setActiveUnit] = useState(units[0]);

  const currentEmailRaw = typeof window !== "undefined" ? localStorage.getItem("currentUserEmail") ?? "" : "";
  const currentUserName = normalizeUserLabel(currentEmailRaw) || "Operador Admin";
  const currentEmail = currentEmailRaw || "carlos@delivery.com";

  const handleNavigate = (path: string, state?: unknown) => {
    navigate(path, state ? { state } : undefined);
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
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <LocalShippingRoundedIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.15, fontWeight: 800 }} noWrap>
              Delivery Manager
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Gestão Multi-Filial
            </Typography>
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => handleNavigate("/listagem-entregas", { openCreate: true })}
          sx={{ borderRadius: 2.5, py: 1.1 }}
        >
          Novo Pedido
        </Button>
      </Stack>

      <Box sx={{ px: 1.5, overflowY: "auto", flex: 1 }}>
        <List disablePadding>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname === "/dashboard/relatorios");

            return (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.5,
                  py: 1,
                  color: isActive ? "primary.contrastText" : "text.secondary",
                  bgcolor: isActive ? "primary.main" : "transparent",
                  "&:hover": {
                    bgcolor: isActive ? "primary.main" : alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 650, fontSize: 13.5 }} />
                {item.badge ? (
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.6,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      bgcolor: isActive ? "rgba(255,255,255,0.24)" : alpha(theme.palette.primary.main, 0.14),
                      color: isActive ? "primary.contrastText" : "primary.main",
                    }}
                  >
                    {item.badge}
                  </Box>
                ) : null}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 1.75 }}>
        <ButtonBase
          onClick={(event) => setProfileAnchorEl(event.currentTarget)}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1,
            borderRadius: 2.5,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", fontSize: 13, fontWeight: 700 }}>
            {getAvatarLabel(currentUserName)}
          </Avatar>
          <Box sx={{ minWidth: 0, textAlign: "left" }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.15 }} noWrap>
              {currentUserName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {currentEmail}
            </Typography>
          </Box>
        </ButtonBase>

        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2.5, mt: 0.5, color: "text.secondary", "&:hover": { color: "error.main" } }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sair" primaryTypographyProps={{ fontWeight: 650, fontSize: 13.5 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 1.5, sm: 3 }, gap: 1.25 }}>
          <IconButton onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menu" sx={{ display: { md: "none" } }}>
            <MenuRoundedIcon />
          </IconButton>

          <Button
            onClick={(event) => setUnitAnchorEl(event.currentTarget)}
            startIcon={<ApartmentRoundedIcon fontSize="small" />}
            endIcon={<ExpandMoreRoundedIcon fontSize="small" />}
            sx={{
              flexShrink: 0,
              borderRadius: 999,
              border: 1,
              borderColor: "divider",
              color: "text.primary",
              px: 1.5,
              display: { xs: "none", sm: "inline-flex" },
            }}
          >
            {activeUnit}
          </Button>
          <Menu anchorEl={unitAnchorEl} open={Boolean(unitAnchorEl)} onClose={() => setUnitAnchorEl(null)}>
            {units.map((unit) => (
              <MenuItem
                key={unit}
                selected={unit === activeUnit}
                onClick={() => {
                  setActiveUnit(unit);
                  setUnitAnchorEl(null);
                }}
              >
                {unit}
              </MenuItem>
            ))}
          </Menu>

          <TextField
            size="small"
            placeholder="Buscar pedido, cliente, entregador..."
            sx={{ flex: 1, minWidth: 0, display: { xs: "none", sm: "block" } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />

          <Button
            variant="outlined"
            startIcon={<FilterListRoundedIcon fontSize="small" />}
            sx={{ display: { xs: "none", lg: "inline-flex" }, borderRadius: 999 }}
          >
            Filtros
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/listagem-entregas", { state: { openCreate: true } })}
            sx={{ borderRadius: 999, display: { xs: "none", sm: "inline-flex" } }}
          >
            Nova Entrega
          </Button>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <Tooltip title="Atualizar">
              <IconButton>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notificações">
              <IconButton>
                <Badge color="error" variant="dot">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Configurações">
              <IconButton onClick={() => navigate("/configuracoes/visuais")}>
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
              <IconButton onClick={toggleMode}>
                {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={() => setProfileAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
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
        <Box sx={{ maxWidth: 1600, mx: "auto", width: "100%" }}>{children ?? <Outlet />}</Box>
      </Box>

      <FloatingChatWidget />
    </Box>
  );
};

export default AppShell;
