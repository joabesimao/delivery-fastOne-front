import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  TwoWheeler as TwoWheelerIcon,
  LocationOn as LocationOnIcon,
  LocationCity as LocationCityIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { FaRoute, FaClipboardCheck } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

// ── Palette (computada dinamicamente no componente via useTheme) ─────────────
// As constantes abaixo são substituídas por valores do tema no corpo do componente.

interface MenuVerticalProps {
  open: boolean;
  drawerWidth: number;
}

interface SubMenuItem {
  text: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  path: string;
  title: string;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  path: string | null;
  title: string;
  subItems?: SubMenuItem[];
}

const MenuVertical: React.FC<MenuVerticalProps> = ({ open, drawerWidth }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(true);

  // ── Palette dinâmica ────────────────────────────────────────────────────
  const SIDEBAR_BG      = isDark ? "#0F0F17" : "#F4F5F7";
  const SIDEBAR_BORDER  = isDark ? "rgba(255,255,255,0.07)" : "#E2E4E9";
  const TEXT_PRIMARY    = isDark ? "#E2E4EC" : "#1A1D23";
  const TEXT_SECONDARY  = isDark ? "#7C7F8E" : "#6B7280";
  const ICON_COLOR      = isDark ? "#7C7F8E" : "#6B7280";
  const ACTIVE_BG       = isDark ? "rgba(67,97,238,0.18)" : "#E8ECFF";
  const ACTIVE_TEXT     = "#4361EE";
  const ACTIVE_ICON     = "#4361EE";
  const HOVER_BG        = isDark ? "rgba(255,255,255,0.05)" : "#ECEEF2";
  const SUB_ACTIVE_BG   = isDark ? "rgba(67,97,238,0.14)" : "#E8ECFF";
  const SCROLLBAR_THUMB = isDark ? "#2E2E40" : "#C4C9D4";

  const navigateRouter = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const drawerWidthCollapsed = 72;
  const currentDrawerWidth = isMenuExpanded ? drawerWidth : drawerWidthCollapsed;

  const handleToggleSubMenu = useCallback((menuKey: string) => {
    setOpenSubMenu((current) => (current === menuKey ? null : menuKey));
  }, []);

  const handleDrawerClose = () => {
    if (isMobile) return;
    setIsMenuExpanded(false);
  };

  const listItemsMenu = useMemo<MenuItem[]>(
    () => [
      {
        text: "Entregas",
        icon: <LocalShippingIcon sx={{ color: ICON_COLOR, fontSize: 22 }} />,
        activeIcon: <LocalShippingIcon sx={{ color: ACTIVE_ICON, fontSize: 22 }} />,
        path: null,
        title: "Entregas",
        subItems: [
          {
            text: "Realizar entrega",
            icon: <FaRoute size={18} color={ICON_COLOR} />,
            activeIcon: <FaRoute size={18} color={ACTIVE_ICON} />,
            path: "/realizar-entrega",
            title: "Realizar Entrega",
          },
          {
            text: "Finalizar entrega",
            icon: <FaClipboardCheck size={18} color={ICON_COLOR} />,
            activeIcon: <FaClipboardCheck size={18} color={ACTIVE_ICON} />,
            path: "/finalizar-entrega",
            title: "Finalizar Entrega",
          },
          {
            text: "Relatórios",
            icon: <IoDocumentText size={19} color={ICON_COLOR} />,
            activeIcon: <IoDocumentText size={19} color={ACTIVE_ICON} />,
            path: "/relatorios-entregas",
            title: "Relatórios das Entregas",
          },
        ],
      },
      {
        text: "Cadastros",
        icon: <AssignmentIcon sx={{ color: ICON_COLOR, fontSize: 22 }} />,
        activeIcon: <AssignmentIcon sx={{ color: ACTIVE_ICON, fontSize: 22 }} />,
        path: null,
        title: "Cadastros",
        subItems: [
          {
            text: "Cadastrar cliente",
            icon: <PersonAddIcon sx={{ color: ICON_COLOR, fontSize: 18 }} />,
            activeIcon: <PersonAddIcon sx={{ color: ACTIVE_ICON, fontSize: 18 }} />,
            path: "/cadastros/cliente",
            title: "Cadastrar Cliente",
          },
          {
            text: "Cadastrar entregador",
            icon: <TwoWheelerIcon sx={{ color: ICON_COLOR, fontSize: 18 }} />,
            activeIcon: <TwoWheelerIcon sx={{ color: ACTIVE_ICON, fontSize: 18 }} />,
            path: "/cadastros/entregador",
            title: "Cadastrar Entregador",
          },
          {
            text: "Cadastrar bairros",
            icon: <LocationOnIcon sx={{ color: ICON_COLOR, fontSize: 18 }} />,
            activeIcon: <LocationOnIcon sx={{ color: ACTIVE_ICON, fontSize: 18 }} />,
            path: "/cadastros/bairros",
            title: "Cadastrar Bairros",
          },
          {
            text: "Cadastrar cidades",
            icon: <LocationCityIcon sx={{ color: ICON_COLOR, fontSize: 18 }} />,
            activeIcon: <LocationCityIcon sx={{ color: ACTIVE_ICON, fontSize: 18 }} />,
            path: "/cadastros/cidades",
            title: "Cadastrar Cidades",
          },
        ],
      },
      {
        text: "Configurações",
        icon: <SettingsIcon sx={{ color: ICON_COLOR, fontSize: 22 }} />,
        activeIcon: <SettingsIcon sx={{ color: ACTIVE_ICON, fontSize: 22 }} />,
        path: null,
        title: "Configurações",
        subItems: [
          {
            text: "Configurações visuais",
            icon: <PaletteIcon sx={{ color: ICON_COLOR, fontSize: 18 }} />,
            activeIcon: <PaletteIcon sx={{ color: ACTIVE_ICON, fontSize: 18 }} />,
            path: "/configuracoes/visuais",
            title: "Configurações Visuais",
          },
        ],
      },
    ],
    [ICON_COLOR, ACTIVE_ICON],
  );

  const drawerInnerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Topo: logo + botão colapso */}
      <Box
        sx={{
          height: "64px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: isMenuExpanded ? "space-between" : "center",
          px: isMenuExpanded ? 2 : 1,
        }}
      >
        {isMenuExpanded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: ACTIVE_TEXT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalShippingIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ color: TEXT_PRIMARY, letterSpacing: "-0.3px" }}
            >
              FastDelivery
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={() => setIsMenuExpanded((prev) => !prev)}
          aria-label={isMenuExpanded ? "Fechar menu" : "Abrir menu"}
          size="small"
          sx={{
            color: TEXT_SECONDARY,
            "&:hover": { bgcolor: HOVER_BG },
          }}
        >
          {isMenuExpanded ? (
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          ) : (
            <MenuIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: SIDEBAR_BORDER, flexShrink: 0 }} />

      {/* Lista de itens */}
      <List
        sx={{
          pl: isMenuExpanded ? "10px" : "8px",
          pr: isMenuExpanded ? "10px" : "8px",
          pt: 1,
          flexGrow: 1,
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: `${SCROLLBAR_THUMB} transparent`,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: SCROLLBAR_THUMB,
            borderRadius: "8px",
          },
        }}
      >
        {listItemsMenu.map((item, index) => {
          const isSelected = item.path ? location.pathname === item.path : false;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isThisSubmenuOpen = openSubMenu === item.text;
          const anySubActive = item.subItems?.some(
            (s) => location.pathname === s.path,
          );
          const isHighlighted = isSelected || anySubActive;

          return (
            <div key={`${item.text}-${index}`}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  sx={{
                    minHeight: 44,
                    px: 1.5,
                    borderRadius: "8px",
                    justifyContent: isMenuExpanded ? "initial" : "center",
                    bgcolor: isHighlighted && !hasSubItems ? ACTIVE_BG : "transparent",
                    "&:hover": { bgcolor: isHighlighted && !hasSubItems ? ACTIVE_BG : HOVER_BG },
                    transition: "background 0.15s",
                  }}
                  onClick={() => {
                    if (hasSubItems) {
                      handleToggleSubMenu(item.text);
                    } else if (item.path && location.pathname !== item.path) {
                      navigateRouter(item.path);
                      if (openSubMenu) setOpenSubMenu(null);
                    }
                    if (isMobile) handleDrawerClose();
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center",
                      mr: isMenuExpanded ? 1.5 : "auto",
                    }}
                  >
                    {isHighlighted ? (item.activeIcon ?? item.icon) : item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "13px",
                          fontWeight: isHighlighted ? 700 : 500,
                          color: isHighlighted ? ACTIVE_TEXT : TEXT_PRIMARY,
                          lineHeight: 1.4,
                        },
                      },
                    }}
                    sx={{ opacity: isMenuExpanded ? 1 : 0 }}
                  />
                  {hasSubItems && isMenuExpanded && (
                    isThisSubmenuOpen
                      ? <ExpandLess sx={{ color: TEXT_SECONDARY, fontSize: 18 }} />
                      : <ExpandMore sx={{ color: TEXT_SECONDARY, fontSize: 18 }} />
                  )}
                </ListItemButton>
              </ListItem>

              {hasSubItems && (
                <Collapse in={isThisSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mb: 0.5 }}>
                    {item.subItems?.map((subItem, subIdx) => {
                      const subIsSelected = location.pathname === subItem.path;
                      return (
                        <ListItem
                          key={`${subItem.text}-${subIdx}`}
                          disablePadding
                          sx={{ pl: isMenuExpanded ? 2 : 0, mb: 0.25 }}
                        >
                          <ListItemButton
                            sx={{
                              minHeight: 40,
                              px: 1.5,
                              borderRadius: "8px",
                              justifyContent: isMenuExpanded ? "initial" : "center",
                              bgcolor: subIsSelected ? SUB_ACTIVE_BG : "transparent",
                              "&:hover": {
                                bgcolor: subIsSelected ? SUB_ACTIVE_BG : HOVER_BG,
                              },
                              transition: "background 0.15s",
                            }}
                            onClick={() => {
                              if (subItem.path && location.pathname !== subItem.path) {
                                navigateRouter(subItem.path);
                              }
                              if (isMobile) handleDrawerClose();
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                justifyContent: "center",
                                mr: isMenuExpanded ? 1.5 : "auto",
                              }}
                            >
                              {subIsSelected
                                ? (subItem.activeIcon ?? subItem.icon)
                                : subItem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.text}
                              slotProps={{
                                primary: {
                                  sx: {
                                    fontSize: "13px",
                                    fontWeight: subIsSelected ? 700 : 500,
                                    color: subIsSelected ? ACTIVE_TEXT : TEXT_SECONDARY,
                                    whiteSpace: "nowrap",
                                  },
                                },
                              }}
                              sx={{ opacity: isMenuExpanded ? 1 : 0 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>

      {/* Rodapé */}
      <Divider sx={{ borderColor: SIDEBAR_BORDER, flexShrink: 0 }} />
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
        }}
      >
        {isMenuExpanded ? (
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontSize: "11px" }}>
            FastOne © 2026
          </Typography>
        ) : (
          <LocalShippingIcon sx={{ color: SCROLLBAR_THUMB, fontSize: 20 }} />
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: drawerWidth,
            backgroundColor: SIDEBAR_BG,
            borderRight: `1px solid ${SIDEBAR_BORDER}`,
          },
        }}
      >
        {drawerInnerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open={open}
      PaperProps={{
        sx: {
          width: currentDrawerWidth,
          backgroundColor: SIDEBAR_BG,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          overflowX: "hidden",
          transition: "width 0.25s ease",
        },
      }}
    >
      {drawerInnerContent}
    </Drawer>
  );
};

export default MenuVertical;
