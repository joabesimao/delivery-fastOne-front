import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import type { Socket } from "socket.io-client";
import {
  getRealtimeSocket,
  type RealtimeChatMessage,
  type RealtimeSessionReady,
} from "../../services/realtime";
import api from "../../services/api";

const toDataImage = (base64: string | null, mimeType: string | null): string | null => {
  if (!base64) {
    return null;
  }

  const normalizedMime = mimeType || "image/jpeg";
  return `data:${normalizedMime};base64,${base64}`;
};

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

const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get<RealtimeChatMessage[]>("/chat/messages")
      .then((response) => {
        if (!active) {
          return;
        }

        setMessages(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setError((current) => current || "Nao foi possivel carregar mensagens do chat.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const currentSocket = getRealtimeSocket();

    if (!currentSocket) {
      setError((current) => current || "Sessao sem token. Faca login para usar o chat.");
      return;
    }

    setSocket(currentSocket);

    const onSessionReady = (payload: RealtimeSessionReady) => {
      setSession(payload);
      setSelectedUnitId(payload.account.unitStoreId ? String(payload.account.unitStoreId) : "");
    };

    const onHistory = (payload: RealtimeChatMessage[]) => {
      setMessages(payload);
      setLoading(false);
    };

    const onMessage = (payload: RealtimeChatMessage) => {
      setMessages((current) => [...current, payload]);
      setLoading(false);
    };

    const onConnectError = () => {
      setError("Nao foi possivel conectar ao chat em tempo real.");
      setLoading(false);
    };

    currentSocket.on("session:ready", onSessionReady);
    currentSocket.on("chat:history", onHistory);
    currentSocket.on("chat:message", onMessage);
    currentSocket.on("connect_error", onConnectError);

    return () => {
      currentSocket.off("session:ready", onSessionReady);
      currentSocket.off("chat:history", onHistory);
      currentSocket.off("chat:message", onMessage);
      currentSocket.off("connect_error", onConnectError);
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const canSend = useMemo(() => {
    return (text.trim().length > 0 || Boolean(imageBase64)) && !sending;
  }, [imageBase64, sending, text]);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await fileToBase64(file);
      setImageBase64(imageDataUrl);
      setImageMimeType(file.type || "image/jpeg");
      setImageName(file.name);
      setError(null);
    } catch {
      setError("Nao foi possivel carregar a imagem selecionada.");
    } finally {
      event.target.value = "";
    }
  };

  const clearImage = () => {
    setImageBase64(null);
    setImageMimeType(null);
    setImageName("");
  };

  const getApiErrorMessage = (error: unknown): string => {
    return (
      (error as { response?: { data?: { error?: string; message?: string } } })
        ?.response?.data?.error ||
      (error as { response?: { data?: { error?: string; message?: string } } })
        ?.response?.data?.message ||
      "Falha ao enviar mensagem."
    );
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await api.post<RealtimeChatMessage>("/chat/messages", {
        text,
        imageBase64,
        imageMimeType,
        unitStoreId: selectedUnitId ? Number(selectedUnitId) : undefined,
      });

      if (!socket) {
        setMessages((current) => [...current, response.data]);
      }

      setText("");
      clearImage();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const currentUserId = session?.account.id;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Chat entre unidades
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Comunicação em tempo real entre matriz e filiais, com envio de texto e foto.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              select
              label="Loja de envio"
              value={selectedUnitId}
              onChange={(event) => setSelectedUnitId(event.target.value)}
              disabled={!session || session.units.length === 0}
              sx={{ minWidth: { xs: "100%", md: 300 } }}
            >
              <MenuItem value="" disabled>
                {!session ? "Carregando lojas..." : "Selecione uma loja"}
              </MenuItem>
              {session?.units.map((unit) => (
                <MenuItem key={unit.id} value={String(unit.id)}>
                  {unit.name} {unit.isMain ? "(Matriz)" : "(Filial)"}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ flexGrow: 1 }} />

            {session ? (
              <Chip
                label={`Conectado como ${session.account.role === "principal" ? "Matriz" : "Filial"}`}
                color="primary"
                variant="outlined"
              />
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box
            ref={listRef}
            sx={{
              height: { xs: 360, md: 460 },
              overflowY: "auto",
              pr: 1,
              mb: 2,
            }}
          >
            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
                <CircularProgress size={28} />
              </Box>
            ) : null}

            {!loading && messages.length === 0 ? (
              <Alert severity="info">Nenhuma mensagem ainda. Envie a primeira mensagem para sua rede.</Alert>
            ) : null}

            <Stack spacing={1.5}>
              {messages.map((message) => {
                const ownMessage = currentUserId === message.sender.id;
                const imageSource = toDataImage(message.imageBase64, message.imageMimeType);

                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: ownMessage ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: { xs: "92%", md: "72%" },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 1.5,
                        bgcolor: ownMessage ? "primary.main" : "background.paper",
                        color: ownMessage ? "primary.contrastText" : "text.primary",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                          {(message.sender.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ display: "block", lineHeight: 1.1, fontWeight: 700 }}>
                            {message.sender.name}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {message.unitStore?.name || "Loja"} • {formatDateTime(message.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>

                      {message.text ? (
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {message.text}
                        </Typography>
                      ) : null}

                      {imageSource ? (
                        <Box
                          component="img"
                          src={imageSource}
                          alt="Imagem da mensagem"
                          sx={{
                            mt: message.text ? 1 : 0,
                            width: "100%",
                            maxHeight: 280,
                            objectFit: "cover",
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: ownMessage ? "rgba(255,255,255,0.2)" : "divider",
                          }}
                        />
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {imageBase64 ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip label={`Imagem: ${imageName || "selecionada"}`} size="small" />
              <Button size="small" onClick={clearImage}>Remover</Button>
            </Stack>
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              placeholder="Digite sua mensagem para matriz e filiais..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleChooseFile}
                startIcon={<PhotoCameraOutlinedIcon />}
                sx={{ minWidth: 130 }}
              >
                Foto
              </Button>
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!canSend}
                startIcon={<SendRoundedIcon />}
                sx={{ minWidth: 130 }}
              >
                {sending ? "Enviando" : "Enviar"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ChatRealtime;
