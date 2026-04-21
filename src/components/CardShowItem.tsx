import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export interface CardShowItemList {
  icon: React.ReactNode;
  label: string;
}

export interface CardShowItemMenuOption {
  label: string;
  onClick: () => void;
}

interface CardShowItemProps {
  title: string;
  items: CardShowItemList[];
  buttonLabel: string;
  onButtonClick: () => void;
  onEditClick?: () => void;
  hasEditClass: boolean;
  hasView?: boolean;
  hasEdit?: boolean;
  menuOptions?: CardShowItemMenuOption[];
}

export const CardShowItem = ({
  title,
  items,
  buttonLabel,
  onButtonClick,
  hasEditClass,
  onEditClick,
  hasView = true,
  hasEdit = true,
  menuOptions,
}: CardShowItemProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Paper
      elevation={0.5}
      sx={{
        borderRadius: 3,
        border: "1px solid #E4E4E7",
        p: 2.5,
        width: "100%",
        minWidth: { xs: "100%", sm: 260 },
        maxWidth: { xs: "100%", sm: 400 },
        boxSizing: "border-box",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{
          mb: 1,
          color: "#09090B",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>

      <Stack spacing={1} mb={2} sx={{ width: "100%" }}>
        {items.map((item, idx) => (
          <Box
            key={idx}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ flexWrap: "wrap" }}
          >
            {item.icon}
            <Typography
              variant="body1"
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#303030",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                whiteSpace: "normal",
                flex: 1,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mt={1}
        sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
      >
        <Tooltip title={hasView ? "" : "Sem permissão para visualizar"}>
          <span style={{ flex: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              disabled={!hasView}
              onClick={onButtonClick}
              sx={{
                fontWeight: 500,
                fontSize: "16px",
                borderRadius: 2,
                border: "1px solid #E4E4E7",
                color: "#09090B",
                flex: 1,
                px: 2,
                py: 1.2,
                minWidth: 0,
              }}
            >
              {buttonLabel}
            </Button>
          </span>
        </Tooltip>
        {hasEditClass && (
          <Tooltip title={hasEdit ? "Editar" : "Sem permissão para editar"}>
            <span>
              <IconButton
                disabled={!hasEdit}
                onClick={onEditClick}
                sx={{
                  borderRadius: 2,
                  width: { xs: "37.19px", sm: "49.19px" },
                  height: { xs: "37.19px", sm: "49.19px" },
                  border: "1px solid #E0E0E0",
                  bgcolor: !hasEdit ? "#E0E0E0" : "#fff",
                  "&:hover": { bgcolor: !hasEdit ? "#E0E0E0" : "#f5f5f5" },
                  "&:disabled": {
                    bgcolor: "#E0E0E0",
                  },
                  flexShrink: 0,
                }}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {menuOptions && menuOptions.length > 0 && (
          <>
            <IconButton
              onClick={handleOpenMenu}
              sx={{
                borderRadius: 2,
                width: { xs: "37.19px", sm: "49.19px" },
                height: { xs: "37.19px", sm: "49.19px" },
                border: "1px solid #E0E0E0",
                bgcolor: "#fff",
                flexShrink: 0,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <MoreHorizIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              sx={{
                mt: 0.5,
                "& .MuiPaper-root": {
                  borderRadius: 3,
                  minWidth: 230,
                  boxShadow: "0px 4px 16px rgba(0,0,0,0.12)",
                  border: "1px solid #E4E4E7",
                },
                "& .MuiList-root": { py: 0.5 },
              }}
            >
              {menuOptions.map((option, idx) => (
                <MenuItem
                  key={idx}
                  onClick={() => {
                    handleCloseMenu();
                    option.onClick();
                  }}
                  sx={{
                    py: 1.2,
                    px: 2.5,
                    "&:hover": {
                      bgcolor: "#F4F4F5",
                      "& .menu-option-label": { fontWeight: 700 },
                    },
                  }}
                >
                  <Typography
                    className="menu-option-label"
                    variant="body1"
                    sx={{ fontSize: "14px", color: "#09090B" }}
                  >
                    {option.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    </Paper>
  );
};
