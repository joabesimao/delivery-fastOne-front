import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import type { Socket } from "socket.io-client";
import {
  getRealtimeSocket,
  type RealtimeChatMessage,
  type RealtimeSessionReady,
} from "../../services/realtime";

type WidgetPosition = {
  x: number;
  y: number;
};

type DragMeta = {
  id: number;
  offsetX: number;
  offsetY: number;
} | null;

const FAB_SIZE = 56;
const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 620;
const EDGE = 8;

const toDataImage = (base64: string | null, mimeType: string | null): string | null => {
  if (!base64) {
    return null;
  }

  return `data:${mimeType || "image/jpeg"};base64,${base64}`;
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

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getPanelSize = () => {
  if (typeof window === "undefined") {
    return { width: PANEL_WIDTH, height: PANEL_HEIGHT };
  }

  const width = window.innerWidth < 600 ? Math.min(window.innerWidth - 20, 420) : PANEL_WIDTH;
  const height = window.innerWidth < 600 ? Math.min(Math.floor(window.innerHeight * 0.78), 620) : PANEL_HEIGHT;
  return { width, height };
};

const clampPosition = (position: WidgetPosition, open: boolean): WidgetPosition => {
  const widget = open ? getPanelSize() : { width: FAB_SIZE, height: FAB_SIZE };
  const maxX = Math.max(EDGE, window.innerWidth - widget.width - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - widget.height - EDGE);

  return {
    x: clamp(position.x, EDGE, maxX),
    y: clamp(position.y, EDGE, maxY),
  };
};

const FloatingChatWidget = () => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);
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
  const [unreadByStore, setUnreadByStore] = useState<Record<number, number>>({});
  const [position, setPosition] = useState<WidgetPosition>({ x: 0, y: 0 });

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragMeta>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { width } = getPanelSize();
    setPosition(
      clampPosition(
        {
          x: window.innerWidth - width - 24,
          y: window.innerHeight - 96,
        },
        false,
      ),
    );
  }, []);

  useEffect(() => {
    const currentSocket = getRealtimeSocket();

    if (!currentSocket) {
      setError("Sessao sem token para chat.");
      setLoading(false);
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

      if (payload.sender.id === session?.account.id) {
        return;
      }

      const storeId = payload.unitStoreId;
      const isCurrentStore = selectedUnitId && Number(selectedUnitId) === storeId;
      if (open && isCurrentStore) {
        return;
      }

      setUnreadByStore((current) => ({
        ...current,
        [storeId]: (current[storeId] ?? 0) + 1,
      }));
    };

    const onConnectError = () => {
      setError("Falha ao conectar no chat em tempo real.");
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
  }, [open, selectedUnitId, session?.account.id]);

  useEffect(() => {
    if (!open || !selectedUnitId) {
      return;
    }

    const id = Number(selectedUnitId);
    setUnreadByStore((current) => {
      if (!current[id]) {
        return current;
      }

      return {
        ...current,
        [id]: 0,
      };
    });
  }, [open, selectedUnitId]);

  useEffect(() => {
    if (!open || !listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages.length]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) {
        return;
      }

      setPosition(() =>
        clampPosition(
          {
            x: event.clientX - drag.offsetX,
            y: event.clientY - drag.offsetY,
          },
          open,
        ),
      );
    };

    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (drag && drag.id === event.pointerId) {
        dragRef.current = null;
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      setPosition((current) => clampPosition(current, open));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const canSend = useMemo(
    () => (text.trim().length > 0 || Boolean(imageBase64)) && !sending,
    [imageBase64, sending, text],
  );

  const unreadTotal = useMemo(
    () => Object.values(unreadByStore).reduce((sum, value) => sum + value, 0),
    [unreadByStore],
  );

  const handleAttachImage = () => {
    inputFileRef.current?.click();
  };

  const handleChangeFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await fileToBase64(file);
      setImageBase64(dataUrl);
      setImageMimeType(file.type || "image/jpeg");
      setError(null);
    } catch {
      setError("Nao foi possivel carregar a foto.");
    } finally {
      event.target.value = "";
    }
  };

  const clearPhoto = () => {
    setImageBase64(null);
    setImageMimeType(null);
  };

  const handleSend = () => {
    if (!socket || !canSend) {
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
          setError(response?.error || "Nao foi possivel enviar a mensagem.");
          return;
        }

        setText("");
        clearPhoto();
      },
    );
  };

  const handleStoreChange = (newValue: string) => {
    setSelectedUnitId(newValue);

    const id = Number(newValue || 0);
    if (!id) {
      return;
    }

    setUnreadByStore((current) => ({
      ...current,
      [id]: 0,
    }));
  };

  const beginDrag = (event: React.PointerEvent<HTMLElement>) => {
    dragRef.current = {
      id: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
    };
  };

  const myUserId = session?.account.id;
  const panelSize = getPanelSize();

  return (
    <>
      {open ? (
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
            zIndex: theme.zIndex.modal + 2,
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
              bgcolor: "#128C7E",
              color: "#fff",
              cursor: "grab",
              touchAction: "none",
            }}
            onPointerDown={beginDrag}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Chat entre lojas
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: 1.2 }}>
                Estilo WhatsApp - tempo real
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: "#fff" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ px: 1.25, py: 0.9, borderBottom: "1px solid", borderColor: "divider" }}>
            <TextField
              size="small"
              select
              fullWidth
              label="Loja"
              value={selectedUnitId}
              onChange={(event) => handleStoreChange(event.target.value)}
              disabled={!session || session.units.length === 0}
            >
              {session?.units.map((unit) => (
                <MenuItem key={unit.id} value={String(unit.id)}>
                  <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        flexGrow: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        pr: 1,
                      }}
                    >
                      {unit.name} {unit.isMain ? "(Matriz)" : "(Filial)"}
                    </Box>
                    {(unreadByStore[unit.id] ?? 0) > 0 ? (
                      <Badge color="error" badgeContent={unreadByStore[unit.id]} sx={{ mr: 1 }} />
                    ) : null}
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Box>

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
            {error ? (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ) : null}

            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : null}

            {!loading && messages.length === 0 ? (
              <Alert severity="info">Sem mensagens ainda.</Alert>
            ) : null}

            <Stack spacing={0.9}>
              {messages.map((message) => {
                const mine = message.sender.id === myUserId;
                const imageUrl = toDataImage(message.imageBase64, message.imageMimeType);

                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "90%",
                        px: 1.25,
                        py: 0.9,
                        borderRadius: 1.25,
                        bgcolor: mine ? "#DCF8C6" : "#FFFFFF",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.4 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
                          {(message.sender.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap>
                          {message.sender.name}
                        </Typography>
                      </Stack>

                      {message.text ? (
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.35 }}
                        >
                          {message.text}
                        </Typography>
                      ) : null}

                      {imageUrl ? (
                        <Box
                          component="img"
                          src={imageUrl}
                          alt="foto"
                          sx={{ mt: message.text ? 0.75 : 0, width: "100%", borderRadius: 1, maxHeight: 260, objectFit: "cover" }}
                        />
                      ) : null}

                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.45, lineHeight: 1.2 }}>
                        {message.unitStore?.name || "Loja"} • {formatDateTime(message.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Box sx={{ p: 0.9, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            {imageBase64 ? (
              <Box sx={{ mb: 0.75 }}>
                <Alert severity="success" onClose={clearPhoto}>
                  Foto anexada
                </Alert>
              </Box>
            ) : null}

            <Stack direction="row" spacing={0.6} alignItems="flex-end">
              <IconButton color="primary" onClick={handleAttachImage}>
                <AddPhotoAlternateOutlinedIcon />
              </IconButton>
              <TextField
                size="small"
                fullWidth
                multiline
                maxRows={3}
                placeholder="Digite uma mensagem..."
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
              <IconButton
                onClick={handleSend}
                disabled={!canSend}
                sx={{
                  bgcolor: "#25D366",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#1DAE54",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#9adfb6",
                    color: "#fff",
                  },
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      ) : null}

      <Badge
        badgeContent={unreadTotal}
        color="error"
        sx={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: theme.zIndex.modal + 3,
        }}
      >
        <Fab
          onClick={() => setOpen(true)}
          onPointerDown={beginDrag}
          sx={{
            bgcolor: "#25D366",
            color: "#fff",
            touchAction: "none",
            "&:hover": {
              bgcolor: "#1DAE54",
            },
          }}
          aria-label="Abrir chat"
        >
          <ChatIcon />
        </Fab>
      </Badge>

      <input ref={inputFileRef} type="file" accept="image/*" hidden onChange={handleChangeFile} />
    </>
  );
};

export default FloatingChatWidget;
