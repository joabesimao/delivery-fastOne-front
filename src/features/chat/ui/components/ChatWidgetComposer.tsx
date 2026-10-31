import { useRef, type ChangeEvent } from "react";
import { Alert, Box, IconButton, Stack, TextField } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { COLORS } from "@/shared/theme/colors";
interface ChatWidgetComposerProps {
  text: string;
  hasAttachment: boolean;
  canSend: boolean;
  onTextChange: (text: string) => void;
  onAttach: (file: File) => Promise<void>;
  onClearAttachment: () => void;
  onSend: () => void;
}

const ChatWidgetComposer = ({
  text,
  hasAttachment,
  canSend,
  onTextChange,
  onAttach,
  onClearAttachment,
  onSend,
}: ChatWidgetComposerProps) => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onAttach(file);
    event.target.value = "";
  };

  return (
    <Box
      sx={{
        p: 0.9,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {hasAttachment && (
        <Box sx={{ mb: 0.75 }}>
          <Alert severity="success" onClose={onClearAttachment}>
            Foto anexada
          </Alert>
        </Box>
      )}

      <Stack direction="row" spacing={0.6} alignItems="flex-end">
        <IconButton
          color="primary"
          onClick={() => inputFileRef.current?.click()}
        >
          <AddPhotoAlternateOutlinedIcon />
        </IconButton>
        <TextField
          size="small"
          fullWidth
          multiline
          maxRows={3}
          placeholder="Digite uma mensagem..."
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
        />
        <IconButton
          onClick={onSend}
          disabled={!canSend}
          sx={{
            bgcolor: COLORS.chatGreen,
            color: COLORS.white,
            "&:hover": { bgcolor: COLORS.chatGreenHover },
            "&.Mui-disabled": {
              bgcolor: COLORS.chatGreenDisabled,
              color: COLORS.white,
            },
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      <input
        ref={inputFileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e)}
      />
    </Box>
  );
};

export default ChatWidgetComposer;
