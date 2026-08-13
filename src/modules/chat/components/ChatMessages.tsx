import { Box, Stack, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useMemo } from "react";
import type { RealtimeChatMessage } from "../../../services/realtime";
import { ChatMessageItem } from "./ChatMessageItem";
import InboxIcon from "@mui/icons-material/Inbox";

interface ChatMessagesProps {
  messages: RealtimeChatMessage[];
  loading: boolean;
  currentUserId?: number;
  onDeleteMessage?: (messageId: number) => void;
  selectedStoreId?: string;
}

const groupMessagesByDate = (
  messages: RealtimeChatMessage[],
): { date: string; messages: RealtimeChatMessage[] }[] => {
  const grouped: Record<string, RealtimeChatMessage[]> = {};

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = date.toLocaleDateString("pt-BR");

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(msg);
  });

  return Object.entries(grouped).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
};

const formatDateHeader = (dateString: string): string => {
  const parts = dateString.split("/");
  const date = new Date(
    parseInt(parts[2]),
    parseInt(parts[1]) - 1,
    parseInt(parts[0]),
  );
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hoje";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Ontem";
  }

  return dateString;
};

export const ChatMessages = ({
  messages,
  loading,
  currentUserId,
  onDeleteMessage,
  selectedStoreId,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar mensagens da loja selecionada
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
            {/* Date Divider */}
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

            {/* Messages */}
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
