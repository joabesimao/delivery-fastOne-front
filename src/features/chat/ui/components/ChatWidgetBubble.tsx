import { Avatar, Box, Stack, Typography } from "@mui/material";
import {
  formatMessageDayTime,
  toChatImageSrc,
  type ChatMessage,
} from "../../domain/chatMessage";

import { COLORS } from "@/shared/theme/colors";
const ChatWidgetBubble = ({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
}) => {
  const imageUrl = toChatImageSrc(message.imageBase64, message.imageMimeType);

  return (
    <Box
      sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}
    >
      <Box
        sx={{
          maxWidth: "90%",
          px: 1.25,
          py: 0.9,
          borderRadius: 1.25,
          bgcolor: mine ? COLORS.chatBubbleMine : COLORS.white,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ mb: 0.4 }}
        >
          <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
            {(message.sender.name || "U").charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            noWrap
          >
            {message.sender.name}
          </Typography>
        </Stack>

        {message.text && (
          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.35,
            }}
          >
            {message.text}
          </Typography>
        )}

        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            alt="foto"
            sx={{
              mt: message.text ? 0.75 : 0,
              width: "100%",
              borderRadius: 1,
              maxHeight: 260,
              objectFit: "cover",
            }}
          />
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.45, lineHeight: 1.2 }}
        >
          {message.unitStore?.name || "Loja"} •{" "}
          {formatMessageDayTime(message.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatWidgetBubble;
