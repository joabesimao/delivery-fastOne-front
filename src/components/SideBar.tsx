import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useMediaQuery,
  AppBar,
  Toolbar,
  ListItemButton,
  Collapse,
} from "@mui/material";
import { Menu as MenuIcon, Logout as LogoutIcon } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardOpen, setDashboardOpen] = useState(
    location.pathname.startsWith("/dashboard")
  );
  const [entregasOpen, setEntregasOpen] = useState(
    location.pathname.startsWith("/listagem") || location.pathname.startsWith("/realizar") || location.pathname.startsWith("/finalizar") || location.pathname.startsWith("/relatorios-entregas")
  );

  const handleMenuToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/usuarios",
      label: "Usuários",
      icon: <PeopleAltIcon sx={{ color: "#fff" }} />,
    },
  ];

  return (
    <>
      {isMobile && (
        <AppBar position="fixed" sx={{ backgroundColor: "#003459" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleMenuToggle}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleMenuToggle}
        sx={{
          width: open ? 240 : 60,
          flexShrink: 0,
          transition: "width 0.3s",
          "& .MuiDrawer-paper": {
            width: open ? 240 : 60,
            transition: "width 0.3s",
            backgroundColor: "#003459",
            color: "#fff",
            overflowX: "hidden",
          },
        }}
      >
        <div
          onClick={handleMenuToggle}
          style={{
            color: "#fff",
            margin: 8,
            transition: "all 0.3s",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          <Typography variant="h6" sx={{ display: open ? "block" : "none" }}>
            Menu
          </Typography>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </div>

        <List>
          {/* Dashboard com submenu */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setDashboardOpen((prev) => !prev)}
              sx={{
                backgroundColor: location.pathname.startsWith("/dashboard")
                  ? "#1e293b"
                  : "transparent",
                borderRadius: 1,
                "&:hover": { backgroundColor: "#334155" },
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: "#fff" }} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
              {open && (dashboardOpen ? <ExpandLess sx={{ color: "#fff" }} /> : <ExpandMore sx={{ color: "#fff" }} />)}
            </ListItemButton>
          </ListItem>

          <Collapse in={dashboardOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                onClick={() => navigate("/dashboard/clientes")}
                sx={{
                  pl: 4,
                  backgroundColor:
                    location.pathname === "/dashboard/clientes"
                      ? "#0f172a"
                      : "transparent",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#334155" },
                }}
              >
                <ListItemIcon>
                  <FormatListBulletedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Lista de Clientes"
                  primaryTypographyProps={{ fontSize: 13 }}
                />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Entregas com submenu */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setEntregasOpen((prev) => !prev)}
              sx={{
                backgroundColor: (
                  location.pathname.startsWith("/listagem") ||
                  location.pathname.startsWith("/realizar") ||
                  location.pathname.startsWith("/finalizar") ||
                  location.pathname.startsWith("/relatorios-entregas")
                ) ? "#1e293b" : "transparent",
                borderRadius: 1,
                "&:hover": { backgroundColor: "#334155" },
              }}
            >
              <ListItemIcon>
                <LocalShippingIcon sx={{ color: "#fff" }} />
              </ListItemIcon>
              <ListItemText primary="Entregas" />
              {open && (entregasOpen ? <ExpandLess sx={{ color: "#fff" }} /> : <ExpandMore sx={{ color: "#fff" }} />)}
            </ListItemButton>
          </ListItem>

          <Collapse in={entregasOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                onClick={() => navigate("/listagem-entregadores")}
                sx={{
                  pl: 4,
                  backgroundColor:
                    location.pathname === "/listagem-entregadores"
                      ? "#0f172a"
                      : "transparent",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#334155" },
                }}
              >
                <ListItemIcon>
                  <FormatListBulletedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Entregadores"
                  primaryTypographyProps={{ fontSize: 13 }}
                />
              </ListItemButton>
            </List>
          </Collapse>

          <List component="div" disablePadding>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    backgroundColor:
                      location.pathname === item.path
                        ? "#1e293b"
                        : "transparent",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#334155",
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <ListItem sx={{ marginTop: "auto", padding: 0 }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#334155",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: "#fff" }} />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
