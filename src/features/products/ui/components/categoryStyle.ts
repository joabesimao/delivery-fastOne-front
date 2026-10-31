import type { SvgIconComponent } from "@mui/icons-material";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import IcecreamRoundedIcon from "@mui/icons-material/IcecreamRounded";
import LocalBarRoundedIcon from "@mui/icons-material/LocalBarRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import LocalPizzaRoundedIcon from "@mui/icons-material/LocalPizzaRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";

export interface CategoryStyle {
  color: string;
  icon: SvgIconComponent;
}

const CATEGORY_PALETTE: CategoryStyle[] = [
  { color: "#EF4444", icon: FastfoodRoundedIcon },
  { color: "#F59E0B", icon: LocalPizzaRoundedIcon },
  { color: "#0EA5E9", icon: LocalBarRoundedIcon },
  { color: "#EC4899", icon: IcecreamRoundedIcon },
  { color: "#8B5CF6", icon: RestaurantRoundedIcon },
  { color: "#10B981", icon: LocalCafeRoundedIcon },
];

export const categoryStyleOf = (category: string): CategoryStyle => {
  let hash = 0;
  for (let i = 0; i < category.length; i++)
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
};

export const STOCK_COLOR = { low: "#F59E0B", in: "#10B981" } as const;
