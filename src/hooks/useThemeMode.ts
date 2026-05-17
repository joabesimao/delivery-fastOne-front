import { useContext } from "react";
import { ThemeModeContext } from "../context/ThemeModeContext";

const useThemeMode = () => useContext(ThemeModeContext);

export default useThemeMode;
