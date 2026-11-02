import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import {
  formatNavBadge,
  isNavItemActive,
  type NavItem,
} from "./navigation/navItems";

interface SideNavProps {
  items: NavItem[];
  pathname: string;
  onNavigate: (path: string) => void;
}

const SideNav = ({ items, pathname, onNavigate }: SideNavProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack spacing={2} sx={{ p: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <LocalShippingRoundedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ lineHeight: 1.15, fontWeight: 800 }}
              noWrap
            >
              Delivery Manager
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Gestão Multi-Filial
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Box sx={{ px: 1.5, overflowY: "auto", flex: 1 }}>
        <List disablePadding>
          {items.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => onNavigate(item.path)}
                selected={active}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.5,
                  py: 1,
                  color: active ? "primary.contrastText" : "text.secondary",
                  bgcolor: active ? "primary.main" : "transparent",
                  "&:hover": {
                    bgcolor: active
                      ? "primary.main"
                      : alpha(theme.palette.primary.main, 0.08),
                  },
                  "&.Mui-selected, &.Mui-selected:hover": {
                    bgcolor: "primary.main",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 650, fontSize: 13.5 }}
                />
                {item.badge ? (
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.6,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      bgcolor: active
                        ? "rgba(255,255,255,0.24)"
                        : alpha(theme.palette.primary.main, 0.14),
                      color: active ? "primary.contrastText" : "primary.main",
                    }}
                  >
                    {formatNavBadge(item.badge)}
                  </Box>
                ) : null}
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default SideNav;
