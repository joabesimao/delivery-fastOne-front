import { useEffect, useRef } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { useChatWidget } from "../../application/useChatWidget";
import { useDraggableWidget } from "../../application/useDraggableWidget";
import ChatWidgetBubble from "./ChatWidgetBubble";
import ChatWidgetComposer from "./ChatWidgetComposer";
import ChatWidgetStoreSelect from "./ChatWidgetStoreSelect";

import { COLORS } from "@/shared/theme/colors";
const FloatingChatWidget = () => {
  const theme = useTheme();
  const widget = useChatWidget();
  const { channel, composer } = widget;
  const { position, panelSize, beginDrag } = useDraggableWidget(widget.open);
  const listRef = useRef<HTMLDivElement | null>(null);
  const myUserId = channel.session?.account.id;

  useEffect(() => {
    if (widget.open && listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [widget.open, channel.messages.length]);

  return (
    <>
      {widget.open && (
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            left: position.x,
            top: position.y,
            width: panelSize.width,
            height: panelSize.height,
            borderRadius: 2,
            overflow: "hidden",
            zIndex: theme.zIndex.drawer + 1,
            display: "flex",
            flexDirection: "column",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.5,
              py: 1,
              bgcolor: COLORS.chatTeal,
              color: COLORS.white,
              cursor: "grab",
              touchAction: "none",
            }}
            onPointerDown={beginDrag}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Chat entre lojas
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, lineHeight: 1.2 }}
              >
                Estilo WhatsApp - tempo real
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={widget.closeWidget}
              sx={{ color: COLORS.white }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <ChatWidgetStoreSelect
            session={channel.session}
            value={channel.selectedUnitId}
            unreadByStore={widget.unreadByStore}
            onChange={widget.changeStore}
          />

          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1,
              background:
                "linear-gradient(180deg, rgba(18,140,126,0.08) 0%, rgba(255,255,255,0) 40%), #f2f8f7",
            }}
          >
            {channel.error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {channel.error}
              </Alert>
            )}
            {channel.loading && (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!channel.loading && channel.messages.length === 0 && (
              <Alert severity="info">Sem mensagens ainda.</Alert>
            )}
            <Stack spacing={0.9}>
              {channel.messages.map((message) => (
                <ChatWidgetBubble
                  key={message.id}
                  message={message}
                  mine={message.sender.id === myUserId}
                />
              ))}
            </Stack>
          </Box>

          <ChatWidgetComposer
            text={composer.text}
            hasAttachment={Boolean(composer.attachment)}
            canSend={composer.canSend}
            onTextChange={composer.setText}
            onAttach={composer.attach}
            onClearAttachment={composer.clearAttachment}
            onSend={() => void composer.send()}
          />
        </Paper>
      )}

      <Badge
        badgeContent={widget.unreadTotal}
        color="error"
        sx={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: theme.zIndex.drawer + 2,
        }}
      >
        <Fab
          onClick={widget.openWidget}
          onPointerDown={beginDrag}
          sx={{
            bgcolor: COLORS.chatGreen,
            color: COLORS.white,
            touchAction: "none",
            "&:hover": { bgcolor: COLORS.chatGreenHover },
          }}
          aria-label="Abrir chat"
        >
          <ChatIcon />
        </Fab>
      </Badge>
    </>
  );
};

export default FloatingChatWidget;
