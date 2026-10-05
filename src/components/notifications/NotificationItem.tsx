import type { ReactNode } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, IconButton, ListItemButton, Stack, Tooltip, Typography } from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalGasStationOutlinedIcon from "@mui/icons-material/LocalGasStationOutlined";
import OilBarrelOutlinedIcon from "@mui/icons-material/OilBarrelOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import type { AppNotification, NotificationType } from "../../services/notifications";
import { formatRelative } from "../../helpers/formatDate";

type PaletteKey = "primary" | "secondary" | "warning" | "info" | "success";

const TYPE_STYLE: Record<NotificationType, { icon: ReactNode; color: PaletteKey }> = {
  chat_message: { icon: <ChatOutlinedIcon fontSize="small" />, color: "primary" },
  oil_change_due: { icon: <OilBarrelOutlinedIcon fontSize="small" />, color: "warning" },
  oil_change_created: { icon: <BuildOutlinedIcon fontSize="small" />, color: "success" },
  fuel_refill_created: { icon: <LocalGasStationOutlinedIcon fontSize="small" />, color: "info" },
  admin_notice: { icon: <CampaignOutlinedIcon fontSize="small" />, color: "secondary" },
};

interface NotificationItemProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  onRemove: (notification: AppNotification) => void;
}

const NotificationItem = ({ notification, onOpen, onRemove }: NotificationItemProps) => {
  const theme = useTheme();
  const unread = !notification.readAt;
  const style = TYPE_STYLE[notification.type] ?? TYPE_STYLE.admin_notice;
  const color = theme.palette[style.color].main;

  return (
    <ListItemButton
      onClick={() => onOpen(notification)}
      alignItems="flex-start"
      sx={{
        gap: 1.5,
        py: 1.25,
        pr: 5,
        position: "relative",
        bgcolor: unread ? alpha(theme.palette.primary.main, 0.05) : "transparent",
        "&:hover .notification-remove": { opacity: 1 },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(color, 0.14),
          color,
        }}
      >
        {style.icon}
      </Box>

      <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: unread ? 750 : 600, flex: 1, minWidth: 0 }} noWrap>
            {notification.title}
          </Typography>
          {unread ? (
            <Box
              aria-label="Não lida"
              sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }}
            />
          ) : null}
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: 13,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {notification.body}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {formatRelative(notification.updatedAt)}
        </Typography>
      </Stack>

      <Tooltip title="Remover">
        <IconButton
          className="notification-remove"
          size="small"
          aria-label="Remover notificação"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(notification);
          }}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            opacity: { xs: 1, md: 0 },
            transition: "opacity 120ms",
            "&:focus-visible": { opacity: 1 },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </ListItemButton>
  );
};

export default NotificationItem;
