import "./App.css";
import { Box } from "@mui/material";
import MenuVertical from "./components/menu/menuVertical";
import { Outlet } from "react-router-dom";
import ThemeModeProvider from "./context/ThemeModeProvider";

function AppLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        transition: "background-color 0.3s ease",
      }}
    >
      <MenuVertical open={true} drawerWidth={240} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "background.default",
          transition: "background-color 0.3s ease",
        }}
      >
        <Outlet />
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
