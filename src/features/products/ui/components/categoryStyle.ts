import type { SvgIconComponent } from "@mui/icons-material";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import IcecreamRoundedIcon from "@mui/icons-material/IcecreamRounded";
import LocalBarRoundedIcon from "@mui/icons-material/LocalBarRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import LocalPizzaRoundedIcon from "@mui/icons-material/LocalPizzaRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";

import { COLORS } from "@/shared/theme/colors";
export interface CategoryStyle {
  color: string;
  icon: SvgIconComponent;
}

const CATEGORY_PALETTE: CategoryStyle[] = [
  { color: COLORS.danger, icon: FastfoodRoundedIcon },
  { color: COLORS.warning, icon: LocalPizzaRoundedIcon },
  { color: COLORS.info, icon: LocalBarRoundedIcon },
  { color: "#EC4899", icon: IcecreamRoundedIcon },
  { color: COLORS.violet, icon: RestaurantRoundedIcon },
  { color: COLORS.success, icon: LocalCafeRoundedIcon },
];

export const categoryStyleOf = (category: string): CategoryStyle => {
  let hash = 0;
  for (let i = 0; i < category.length; i++)
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
};

export const STOCK_COLOR = { low: COLORS.warning, in: COLORS.success } as const;
