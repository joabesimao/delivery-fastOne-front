import { Avatar, Box, Chip, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";

export interface ItemCustomListProps {
  icon: ReactNode;
  iconBgColor?: string;
  title: string;
  subtitle: string;
  chipLabel: string;
  chipColor: string;
  timestamp: string;
}

const ItemCustomList = ({
  icon,
  iconBgColor = "#2196F3",

  title,
  subtitle,
  chipLabel,
  chipColor,
  timestamp,
}: ItemCustomListProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid #E4E4E7",
        backgroundColor: "#FFFFFF",
        transition: "all 0.2s",
        flexShrink: 0,
        minWidth: 400,
        "&:hover": {
          backgroundColor: "#F9FAFB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Avatar
        sx={{
          backgroundColor: iconBgColor,
          width: 48,
          height: 48,
        }}
      >
        {icon}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={title} arrow>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "#18181B",
              fontSize: "0.95rem",
              mb: 0.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        </Tooltip>
        <Tooltip title={subtitle} arrow>
          <Typography
            variant="body2"
            sx={{
              color: "#71717A",
              fontSize: "0.85rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </Typography>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 0.5,
          flex: 1,
        }}
      >
        <Chip
          label={chipLabel}
          size="small"
          sx={{
            color: chipColor,
            bgcolor: `${chipColor}1A`,
            fontWeight: 500,
            fontSize: "0.75rem",
            height: 24,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "#A1A1AA",
            fontSize: "0.75rem",
          }}
        >
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

export default ItemCustomList;
