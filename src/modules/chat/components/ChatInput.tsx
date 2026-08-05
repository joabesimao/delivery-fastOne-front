import {
  Box,
  TextField,
  Button,
  Stack,
  Chip,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import { useRef, useState, useCallback, type ChangeEvent } from "react";

interface ChatInputProps {
  disabled?: boolean;
  sending?: boolean;
  text: string;
  imageName?: string;
  hasImage: boolean;
  onTextChange: (text: string) => void;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
  onSend: () => void;
  maxMessageLength?: number;
}

export const ChatInput = ({
  disabled = false,
  sending = false,
  text,
  imageName = "",
  hasImage = false,
  onTextChange,
  onImageSelect,
  onImageClear,
  onSend,
  maxMessageLength = 2000,
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem válida.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        alert("A imagem não pode ter mais de 10MB.");
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
      event.target.value = "";
    },
    [onImageSelect],
  );

  const handleClearImage = useCallback(() => {
    setImagePreview(null);
    onImageClear();
  }, [onImageClear]);

  const handleSend = useCallback(() => {
    if (text.trim().length === 0 && !hasImage) {
      return;
    }
    onSend();
  }, [text, hasImage, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey) {
        handleSend();
      }
    },
    [handleSend],
  );

  const charCount = text.length;
  const isNearLimit = charCount > maxMessageLength * 0.8;

  return (
    <Box>
      {/* Image Preview */}
      {imagePreview && (
        <Box sx={{ mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 2,
              bgcolor: "grey.100",
            }}
          >
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
                display: "block",
              }}
            />
            <Tooltip title="Remover imagem">
              <IconButton
                size="small"
                onClick={handleClearImage}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 1)",
                  },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Paper>
          <Chip
            label={`Imagem: ${imageName || "selecionada"}`}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Input Area */}
      <Stack spacing={1.5}>
        {/* Text Input */}
        <Box>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              px: 1,
            }}
          >
            <Typography
              variant="caption"
              color={isNearLimit ? "error" : "text.secondary"}
            >
              {charCount} / {maxMessageLength}
            </Typography>
            {isNearLimit && (
              <Typography variant="caption" color="error">
                Limite de caracteres próximo
              </Typography>
            )}
          </Box>
        </Box>

        {/* Buttons */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            startIcon={<PhotoCameraOutlinedIcon />}
            sx={{
              flex: { xs: 1, sm: "0 1 auto" },
            }}
          >
            {hasImage ? "Alterar Foto" : "Adicionar Foto"}
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            variant="contained"
            onClick={handleSend}
            disabled={
              disabled || sending || (text.trim().length === 0 && !hasImage)
            }
            endIcon={<SendRoundedIcon />}
            sx={{
              minWidth: 140,
              flex: { xs: 1, sm: "0 1 auto" },
            }}
          >
            {sending ? "Enviando..." : "Enviar"}
          </Button>
        </Stack>

        {sending && (
          <LinearProgress
            variant="indeterminate"
            sx={{
              height: 2,
              borderRadius: 1,
            }}
          />
        )}
      </Stack>

      {/* Hidden File Input */}
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
