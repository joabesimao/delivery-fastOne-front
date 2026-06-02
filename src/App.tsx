import "./App.css";
import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuVertical from "./components/menu/menuVertical";
import { Outlet } from "react-router-dom";
import ThemeModeProvider from "./context/ThemeModeProvider";

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            width: { xs: 42, sm: 46 },
            height: { xs: 42, sm: 46 },
            bgcolor: "#FFFFFF",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 26px rgba(35, 47, 69, 0.14)",
            "&:hover": { bgcolor: "#F6F9FF" },
          }}
        >
          <MenuRoundedIcon sx={{ color: "text.primary" }} />
        </IconButton>
      )}

      <MenuVertical
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        drawerWidth={290}
      />

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
