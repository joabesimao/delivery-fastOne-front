import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { COLORS } from "@/shared/theme/colors";
const ThemeModeIcon = ({ dark, size }: { dark: boolean; size: number }) =>
  dark ? (
    <DarkModeIcon sx={{ color: COLORS.brand, fontSize: size }} />
  ) : (
    <LightModeIcon sx={{ color: COLORS.warning, fontSize: size }} />
  );

export default ThemeModeIcon;
