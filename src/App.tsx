import "./App.css";
import { Box } from "@mui/material";
import MenuVertical from "./components/menu/menuVertical";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <MenuVertical open={true} drawerWidth={240} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f4f6f8" }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;
