import { Box, Typography } from "@mui/material";

interface TypingIndicatorProps {
  userName?: string;
}

export const TypingIndicator = ({ userName }: TypingIndicatorProps) => {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {userName || "Alguém"} está digitando
      </Typography>
      <Box className="typing-indicator">
        <Box className="typing-dot" />
        <Box className="typing-dot" />
        <Box className="typing-dot" />
      </Box>
    </Box>
  );
};
