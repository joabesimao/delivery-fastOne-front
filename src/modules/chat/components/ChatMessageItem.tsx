import {
  Avatar,
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import type { RealtimeChatMessage } from "../../../services/realtime";

interface ChatMessageItemProps {
  message: RealtimeChatMessage;
  isOwn: boolean;
  onDelete?: (messageId: number) => void;
}

const toDataImage = (
  base64: string | null,
  mimeType: string | null,
): string | null => {
  if (!base64) {
    return null;
  }

  const normalizedMime = mimeType || "image/jpeg";
  return `data:${normalizedMime};base64,${base64}`;
};

const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ChatMessageItem = ({
  message,
  isOwn,
  onDelete,
}: ChatMessageItemProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const imageSource = toDataImage(message.imageBase64, message.imageMimeType);
  const senderInitial = (message.sender.name || "U").charAt(0).toUpperCase();

  return (
    <Box
      className="chat-message-item"
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 2,
        px: { xs: 0.5, sm: 1 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexDirection: isOwn ? "row-reverse" : "row",
          maxWidth: { xs: "90%", sm: "75%", md: "60%" },
          alignItems: "flex-end",
        }}
      >
        {/* Avatar */}
        <Tooltip title={message.sender.name}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 14,
              bgcolor: isOwn ? "primary.main" : "secondary.main",
              flexShrink: 0,
            }}
          >
            {senderInitial}
          </Avatar>
        </Tooltip>

        {/* Message Content */}
        <Box sx={{ flex: 1 }}>
          {/* Sender Info */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ display: "block", mb: 0.25 }}
              >
                {message.sender.name}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "0.7rem",
                  }}
                >
                  {message.unitStore?.name || "Loja"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "0.7rem",
                  }}
                >
                  •
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "0.7rem",
                  }}
                >
                  {formatDateTime(message.createdAt)}
                </Typography>
              </Stack>
            </Box>

            {/* Menu */}
            {isOwn && onDelete && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    opacity: 0.6,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      onDelete(message.id);
                      setAnchorEl(null);
                    }}
                    sx={{ color: "error.main" }}
                  >
                    Deletar
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>

          {/* Message Bubble */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: isOwn ? "primary.main" : "grey.100",
              color: isOwn ? "primary.contrastText" : "text.primary",
              borderRadius: 2,
              borderBottomLeftRadius: !isOwn ? 0 : 12,
              borderBottomRightRadius: isOwn ? 0 : 12,
            }}
          >
            {message.text && (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  mb: imageSource ? 1 : 0,
                }}
              >
                {message.text}
              </Typography>
            )}

            {imageSource && (
              <Box
                component="img"
                src={imageSource}
                alt="Imagem da mensagem"
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 1.5,
                  display: "block",
                  cursor: "pointer",
                  transition: "opacity 0.3s",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              />
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
