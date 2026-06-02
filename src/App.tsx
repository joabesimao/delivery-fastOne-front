import "./App.css";
import { Outlet } from "react-router-dom";
import ThemeModeProvider from "./context/ThemeModeProvider";

function App() {
  return (
    <ThemeModeProvider>
      <Outlet />
    </ThemeModeProvider>
  );
}

export default App;
