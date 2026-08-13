import { useEffect, useState, useCallback, useMemo } from "react";
import { Alert, Box, Card, CardContent, Container } from "@mui/material";
import type { Socket } from "socket.io-client";
import {
  getRealtimeSocket,
  type RealtimeChatMessage,
  type RealtimeSessionReady,
} from "../../services/realtime";
import { ChatHeader, ChatMessages, ChatInput, ChatSearch } from "./components";
import "./chat.css";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Falha ao ler imagem"));
        return;
      }

      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(file);
  });

const ChatRealtime = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<RealtimeSessionReady | null>(null);
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Inicializar socket
  useEffect(() => {
    const currentSocket = getRealtimeSocket();

    if (!currentSocket) {
      setError("Sessão sem token. Faça login para usar o chat.");
      setLoading(false);
      return;
    }

    setSocket(currentSocket);
    setIsConnected(currentSocket.connected);

    const onSessionReady = (payload: RealtimeSessionReady) => {
      setSession(payload);
      setSelectedUnitId(
        payload.account.unitStoreId ? String(payload.account.unitStoreId) : "",
      );
      setError(null);
    };

    const onHistory = (payload: RealtimeChatMessage[]) => {
      setMessages(payload);
      setLoading(false);
    };

    const onMessage = (payload: RealtimeChatMessage) => {
      setMessages((current) => [...current, payload]);
    };

    const onConnectError = () => {
      setIsConnected(false);
      setError(
        "Não foi possível conectar ao chat em tempo real. Reconectando...",
      );
    };

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    currentSocket.on("session:ready", onSessionReady);
    currentSocket.on("chat:history", onHistory);
    currentSocket.on("chat:message", onMessage);
    currentSocket.on("connect_error", onConnectError);
    currentSocket.on("connect", onConnect);
    currentSocket.on("disconnect", onDisconnect);

    return () => {
      currentSocket.off("session:ready", onSessionReady);
      currentSocket.off("chat:history", onHistory);
      currentSocket.off("chat:message", onMessage);
      currentSocket.off("connect_error", onConnectError);
      currentSocket.off("connect", onConnect);
      currentSocket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        const imageDataUrl = await fileToBase64(file);
        setImageBase64(imageDataUrl);
        setImageMimeType(file.type || "image/jpeg");
        setImageName(file.name);
        setError(null);
      } catch {
        setError("Não foi possível carregar a imagem selecionada.");
      }
    },
    [],
  );

  const handleImageClear = useCallback(() => {
    setImageBase64(null);
    setImageMimeType(null);
    setImageName("");
  }, []);

  const handleSend = useCallback(() => {
    if (!socket || (text.trim().length === 0 && !imageBase64)) {
      return;
    }

    setSending(true);
    setError(null);

    socket.emit(
      "chat:send",
      {
        text,
        imageBase64,
        imageMimeType,
        unitStoreId: selectedUnitId ? Number(selectedUnitId) : undefined,
      },
      (response: { ok?: boolean; error?: string }) => {
        setSending(false);

        if (!response?.ok) {
          setError(response?.error || "Falha ao enviar mensagem.");
          return;
        }

        setText("");
        handleImageClear();
      },
    );
  }, [socket, text, imageBase64, imageMimeType, selectedUnitId, handleImageClear]);

  const handleRefresh = useCallback(() => {
    if (socket) {
      socket.emit("chat:fetch-history");
      setLoading(true);
    }
  }, [socket]);

  const currentUserId = session?.account.id;

  // Filtrar mensagens por busca
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) {
      return messages;
    }

    const query = searchQuery.toLowerCase();
    return messages.filter(
      (msg) =>
        (msg.text && msg.text.toLowerCase().includes(query)) ||
        msg.sender.name.toLowerCase().includes(query) ||
        msg.unitStore?.name.toLowerCase().includes(query),
    );
  }, [messages, searchQuery]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        py: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="lg">
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <ChatHeader
          session={session}
          selectedUnitId={selectedUnitId}
          onUnitChange={setSelectedUnitId}
          isConnected={isConnected}
          unitsCount={session?.units.length ?? 0}
          messagesCount={messages.length}
          onRefresh={handleRefresh}
        />

        {/* Main Chat Area */}
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
            {/* Search and Tabs */}
            <Box sx={{ mb: 2 }}>
              <ChatSearch onSearch={setSearchQuery} />

              {searchQuery && (
                <Box sx={{ mt: 1.5, fontSize: "0.875rem", color: "text.secondary" }}>
                  {filteredMessages.length} resultado
                  {filteredMessages.length !== 1 ? "s" : ""} para "{searchQuery}"
                </Box>
              )}
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                mb: 2,
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
              <ChatMessages
                messages={filteredMessages}
                loading={loading}
                currentUserId={currentUserId}
                selectedStoreId={selectedUnitId}
              />
            </Box>

            {/* Input Area */}
            <ChatInput
              disabled={!session || !isConnected}
              sending={sending}
              text={text}
              imageName={imageName}
              hasImage={Boolean(imageBase64)}
              onTextChange={setText}
              onImageSelect={handleImageSelect}
              onImageClear={handleImageClear}
              onSend={handleSend}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ChatRealtime;
