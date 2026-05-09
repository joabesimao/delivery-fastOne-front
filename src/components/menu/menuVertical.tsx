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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import { FaRoute, FaClipboardCheck } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

interface MenuVerticalProps {
  open: boolean;
  drawerWidth: number;
}

interface SubMenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  title: string;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string | null;
  title: string;
  subItems?: SubMenuItem[];
}

const MenuVertical: React.FC<MenuVerticalProps> = ({ open, drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(true);

  const navigateRouter = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleToggleSubMenu = useCallback((menuKey: string) => {
    setOpenSubMenu((current) => (current === menuKey ? null : menuKey));
  }, []);

  const handleDrawerClose = () => {
    setIsMenuExpanded(false);
  };

  const listItemsMenu = useMemo<MenuItem[]>(
    () => [
      {
        text: "Entregas",
        icon: <LocalShippingIcon sx={{ color: "#fff" }} />,
        path: null,
        title: "Entregas",
        subItems: [
          {
            text: "Realizar entrega",
            icon: <FaRoute size={22} color="#fff" />,
            path: "/realizar-entrega",
            title: "Realizar Entrega",
          },
          {
            text: "Finalizar entrega",
            icon: <FaClipboardCheck size={22} color="#fff" />,
            path: "/finalizar-entrega",
            title: "Finalizar Entrega",
          },
          {
            text: "Relatórios",
            icon: <IoDocumentText size={23} color="#ffffffff" />,
            path: "/relatorios-entregas",
            title: "Relatórios das Entregas",
          },
        ],
      },
    ],
    [],
  );

  const drawerInnerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: "75px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-end" : "center",
          px: 1,
        }}
      >
        <IconButton
          onClick={() => setIsMenuExpanded(!isMenuExpanded)}
          aria-label={isMenuExpanded ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuExpanded ? (
            <KeyboardDoubleArrowLeftIcon sx={{ color: "#fff" }} />
          ) : (
            <MenuIcon sx={{ color: "#fff" }} />
          )}
        </IconButton>
      </Box>
      <Divider sx={{ bgcolor: "#fff", flexShrink: 0 }} />
      <List
        sx={{
          pl: open ? "15px" : "5px",
          pr: open ? "15px" : "5px",
          flexGrow: 1,
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#9ec9f0 transparent",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9ec9f0",
            borderRadius: "8px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#74b5ee" },
          "&::-webkit-scrollbar-thumb:active": { backgroundColor: "#509CDB" },
        }}
      >
        {listItemsMenu.map((item, index) => {
          const isSelected = item.path
            ? location.pathname === item.path
            : false;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isThisSubmenuOpen = openSubMenu === item.text;
          return (
            <div key={`${item.text}-${index}`}>
              <ListItem
                disablePadding
                sx={{
                  bgcolor: isSelected && !hasSubItems ? "#509CDB" : "inherit",
                  color: "#fff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    justifyContent: open ? "initial" : "center",
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
                      mr: open ? "15px" : "auto",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: { sx: { fontSize: "14px", fontWeight: "600" } },
                    }}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                  {hasSubItems && open && (
                    <>
                      {isThisSubmenuOpen ? (
                        <ExpandLess sx={{ color: "#fff" }} />
                      ) : (
                        <ExpandMore sx={{ color: "#fff" }} />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              {hasSubItems && (
                <Collapse in={isThisSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems?.map((subItem, subIdx) => {
                      const subIsSelected = location.pathname === subItem.path;
                      return (
                        <div key={`${subItem.text}-${subIdx}`}>
                          <ListItem
                            disablePadding
                            sx={{
                              bgcolor: subIsSelected ? "#509CDB" : "inherit",
                              color: "#fff",
                              borderRadius: "4px",
                              pl: open ? "23px" : "8px",
                              width: "100%",
                              minWidth: "100%",
                              display: "flex",
                              alignItems: "center",
                              overflow: "visible",
                            }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: open ? 48 : 40,
                                px: 1,
                                py: 1,
                                justifyContent: open ? "initial" : "center",
                                width: "100%",
                                minWidth: "100%",
                                display: "flex",
                                alignItems: "center",
                                overflow: "visible",
                                textOverflow: "unset",
                                flex: "1 1 auto",
                                flexGrow: 1,
                                borderRadius: "4px",
                              }}
                              onClick={() => {
                                if (
                                  subItem.path &&
                                  location.pathname !== subItem.path
                                ) {
                                  navigateRouter(subItem.path);
                                }
                                if (isMobile) handleDrawerClose();
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  justifyContent: "center",
                                  mr: open ? "10px" : "auto",
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                slotProps={{
                                  primary: {
                                    sx: {
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                      overflow: "visible",
                                      textOverflow: "unset",
                                      width: "100%",
                                      display: "block",
                                    },
                                  },
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  flex: "1 1 auto",
                                  minWidth: 0,
                                  width: "100%",
                                  flexGrow: 1,
                                  margin: 0,
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        </div>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <LocalShippingIcon sx={{ color: "#fff", fontSize: open ? 32 : 24 }} />
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
            backgroundColor: "#006DAB",
            borderRight: "none",
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
          width: drawerWidth,
          backgroundColor: "#006DAB",
          borderRight: "none",
          overflowX: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      {drawerInnerContent}
    </Drawer>
  );
};

export default MenuVertical;
