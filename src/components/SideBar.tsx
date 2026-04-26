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
} from "@mui/material";
import { Menu as MenuIcon, Logout as LogoutIcon } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useNavigate, useLocation } from "react-router-dom";

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
