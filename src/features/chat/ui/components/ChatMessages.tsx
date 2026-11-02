import { Box, Stack, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useMemo } from "react";
import {
  formatDateHeader,
  groupMessagesByDate,
  type ChatMessage,
} from "../../domain/chatMessage";
import { ChatMessageItem } from "./ChatMessageItem";
import InboxIcon from "@mui/icons-material/Inbox";

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId?: number;
  onDeleteMessage?: (messageId: number) => void;
  selectedStoreId?: string;
}

export const ChatMessages = ({
  messages,
  loading,
  currentUserId,
  onDeleteMessage,
  selectedStoreId,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredMessages = useMemo(() => {
    if (!selectedStoreId) {
      return messages;
    }

    return messages.filter(
      (msg) => msg.unitStoreId === parseInt(selectedStoreId),
    );
  }, [messages, selectedStoreId]);

  const groupedMessages = useMemo(
    () => groupMessagesByDate(filteredMessages),
    [filteredMessages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages.length]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: { xs: 360, md: 460 },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Carregando mensagens...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: { xs: 360, md: 460 },
          py: 4,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <InboxIcon
            sx={{
              fontSize: 48,
              opacity: 0.5,
            }}
          />
          <Typography variant="body1" color="text.secondary" align="center">
            Nenhuma mensagem ainda
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center">
            Envie a primeira mensagem para sua rede
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: { xs: 360, md: 460 },
        overflowY: "auto",
        pr: 1,
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-track": {
          bgcolor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "divider",
          borderRadius: 3,
          "&:hover": {
            bgcolor: "action.hover",
          },
        },
      }}
    >
      <Stack spacing={0} sx={{ pb: 2 }}>
        {groupedMessages.map((group) => (
          <Box key={group.date}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                my: 2,
                px: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: "divider",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                {formatDateHeader(group.date)}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: "divider",
                }}
              />
            </Box>

            {group.messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                isOwn={currentUserId === message.sender.id}
                onDelete={onDeleteMessage}
              />
            ))}
          </Box>
        ))}
      </Stack>
      <div ref={messagesEndRef} />
    </Box>
  );
};
