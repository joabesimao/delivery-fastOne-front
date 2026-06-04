import "./App.css";
import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuVertical from "./components/menu/menuVertical";
import { Outlet, useNavigate } from "react-router-dom";
import ThemeModeProvider from "./context/ThemeModeProvider";

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();

  const profileMenuOpen = Boolean(profileAnchorEl);
  const currentUserEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("currentUserEmail") || ""
      : "";
  const avatarLabel = useMemo(() => {
    if (!currentUserEmail) return "U";
    return currentUserEmail.trim().charAt(0).toUpperCase() || "U";
  }, [currentUserEmail]);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUserEmail");
    handleCloseProfileMenu();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        position: "relative",
        overflowX: "clip",
        bgcolor: "background.default",
        backgroundImage: (theme) =>
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, #f5f8ff 0%, #f8f9fc 42%, #f7f9fc 100%)"
            : "none",
        transition: "background-color 0.3s ease",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(1100px 520px at 100% -140px, rgba(67,97,238,0.11), transparent 60%)",
        }}
      />

      {!isMenuOpen && (
        <IconButton
          aria-label="Abrir menu"
          onClick={() => setIsMenuOpen(true)}
          sx={{
            position: "fixed",
            top: { xs: 12, sm: 18 },
            left: { xs: 10, sm: 18 },
            zIndex: (theme) => theme.zIndex.drawer + 2,
            p: 0,
            minWidth: 0,
            minHeight: 0,
            width: "auto",
            height: "auto",
            borderRadius: 0,
            bgcolor: "transparent",
            boxShadow: "none",
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          <MenuRoundedIcon
            sx={{
              color: "#4361EE",
              fontSize: { xs: 32, sm: 34 },
              transition: "color 0.2s ease",
              "&:hover": {
                color: "#3451D1",
              },
            }}
          />
        </IconButton>
      )}

      <MenuVertical
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        drawerWidth={290}
      />

      <Box
        sx={{
          position: "fixed",
          top: { xs: 12, sm: 18 },
          right: { xs: 10, sm: 18 },
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Tooltip title="Perfil">
          <IconButton
            aria-label="Abrir perfil"
            onClick={handleOpenProfileMenu}
            sx={{
              width: { xs: 42, sm: 46 },
              height: { xs: 42, sm: 46 },
              borderRadius: 1,
              bgcolor: "#4361EE",
              border: "1px solid",
              borderColor: "#3451D1",
              boxShadow: "0 12px 26px rgba(35, 47, 69, 0.14)",
              "&:hover": { bgcolor: "#3451D1" },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: "transparent",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {avatarLabel}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={profileAnchorEl}
          open={profileMenuOpen}
          onClose={handleCloseProfileMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                borderRadius: 1,
                bgcolor: "#4361EE",
                color: "#FFFFFF",
                border: "1px solid #3451D1",
              },
            },
          }}
        >
          <MenuItem disabled sx={{ opacity: 1 }}>
            <ListItemText
              primary={currentUserEmail || "Usuario"}
              primaryTypographyProps={{
                fontSize: 13,
                fontWeight: 600,
                color: "#C7D2FE",
              }}
            />
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              color: "#FFFFFF",
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            Sair
          </MenuItem>
        </Menu>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: "100%",
          pt: { xs: 7.5, sm: 2.5 },
          pb: { xs: 2, sm: 3 },
          px: { xs: 1.25, sm: 2.5, md: 3 },
          bgcolor: "background.default",
          backgroundColor: "transparent",
          transition: "background-color 0.3s ease",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            width: "100%",
            animation: "contentEnter 220ms ease-out",
            "@keyframes contentEnter": {
              from: { opacity: 0, transform: "translateY(6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <AppLayout />
    </ThemeModeProvider>
  );
}

export default App;
