import { Switch, styled } from "@mui/material";

import { COLORS } from "@/shared/theme/colors";
const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 58,
  height: 32,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 3,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(26px)",
      color: COLORS.white,
      "& + .MuiSwitch-track": {
        backgroundColor: COLORS.brand,
        opacity: 1,
        border: 0,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: COLORS.brand,
      border: "6px solid #fff",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 26,
    height: 26,
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 32 / 2,
    backgroundColor: theme.palette.mode === "dark" ? "#555" : "#C4C9D4",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default ThemeSwitch;
