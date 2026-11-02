import { Alert, Box, Card, CardContent, Container } from "@mui/material";
import { useState } from "react";
import useRealtimeConnection from "@/shared/realtime/useRealtimeConnection";
import { searchResultsLabel } from "../../domain/chatMessage";
import { chatGateway } from "../../data/chatGateway";
import { useChatChannel } from "../../application/useChatChannel";
import { useChatComposer } from "../../application/useChatComposer";
import {
  useChatSearch,
  useRemoveFromChatSearch,
} from "../../application/useChatSearch";
import { useChatTyping } from "../../application/useChatTyping";
import { ChatHeader } from "../components/ChatHeader";
import { ChatInput } from "../components/ChatInput";
import { ChatMessages } from "../components/ChatMessages";
import { ChatSearch } from "../components/ChatSearch";
import { TypingIndicator } from "../components/TypingIndicator";
import "../chat.css";

const SCROLL_SX = {
  flex: 1,
  overflowY: "auto",
  mb: 2,
  pr: 1,
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    bgcolor: "divider",
    borderRadius: 3,
    "&:hover": { bgcolor: "action.hover" },
  },
} as const;

const ChatPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const connected = useRealtimeConnection();

  const removeFromSearch = useRemoveFromChatSearch();
  const channel = useChatChannel({
    noTokenError: "Sessão sem token. Faça login para usar o chat.",
    connectError:
      "Não foi possível conectar ao chat em tempo real. Reconectando...",
    clearErrorOnConnect: true,
    syncDeletes: true,
    onDeleted: removeFromSearch,
  });
  const search = useChatSearch(searchQuery, channel.session?.account.id);
  const typing = useChatTyping(channel.socket);
  const composer = useChatComposer({
    socket: channel.socket,
    selectedUnitId: channel.selectedUnitId,
    sendError: "Falha ao enviar mensagem.",
    imageError: "Não foi possível carregar a imagem selecionada.",
    onError: channel.setError,
    beforeSend: typing.stopTyping,
    onTextChange: typing.notifyTyping,
  });

  const handleDelete = async (messageId: number) => {
    if (!channel.socket) return;
    const ack = await chatGateway.deleteMessage(channel.socket, messageId);
    if (!ack.ok) channel.setError(ack.error || "Falha ao deletar mensagem.");
  };

  const shownMessages = searchQuery.trim()
    ? (search.results ?? [])
    : channel.messages;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: { xs: 2, sm: 3 } }}>
      <Container maxWidth="lg">
        {channel.error && (
          <Alert
            severity="error"
            onClose={() => channel.setError(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {channel.error}
          </Alert>
        )}

        <ChatHeader
          session={channel.session}
          selectedUnitId={channel.selectedUnitId}
          onUnitChange={channel.setSelectedUnitId}
          isConnected={connected}
          unitsCount={channel.session?.units.length ?? 0}
          messagesCount={channel.messages.length}
          onRefresh={channel.refresh}
        />

        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              height: { xs: "calc(100vh - 450px)", md: "calc(100vh - 400px)" },
              minHeight: 650,
              p: { xs: 1.5, sm: 2.5 },
              "&:last-child": { pb: 2.5 },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <ChatSearch onSearch={setSearchQuery} />
              {searchQuery && (
                <Box
                  sx={{
                    mt: 1.5,
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  }}
                >
                  {search.searching
                    ? "Buscando..."
                    : searchResultsLabel(shownMessages.length, searchQuery)}
                </Box>
              )}
            </Box>

            <Box sx={SCROLL_SX}>
              <ChatMessages
                messages={shownMessages}
                loading={channel.loading}
                currentUserId={channel.session?.account.id}
                selectedStoreId={channel.selectedUnitId}
                onDeleteMessage={(id) => void handleDelete(id)}
              />
            </Box>

            {typing.typingLabel && (
              <Box sx={{ mb: 1 }}>
                <TypingIndicator userName={typing.typingLabel} />
              </Box>
            )}

            <ChatInput
              disabled={!channel.session || !connected}
              sending={composer.sending}
              text={composer.text}
              imageName={composer.attachment?.name ?? ""}
              hasImage={Boolean(composer.attachment)}
              onTextChange={composer.setText}
              onImageSelect={(file) => void composer.attach(file)}
              onImageClear={composer.clearAttachment}
              onSend={() => void composer.send()}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ChatPage;
