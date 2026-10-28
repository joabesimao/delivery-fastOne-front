import { useContext } from "react";
import { ThemeModeContext } from "./ThemeModeContext";

const useThemeMode = () => useContext(ThemeModeContext);

export default useThemeMode;
