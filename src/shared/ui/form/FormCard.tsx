import type { ReactNode } from "react";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface FormCardProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
}

const FormCard = ({ title, onBack, children }: FormCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 3, md: 4 },
      width: "100%",
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      backdropFilter: "blur(2px)",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2.5,
      }}
    >
      {onBack ? (
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      ) : (
        <Box sx={{ width: 32 }} />
      )}
      <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
        {title}
      </Typography>
      <Box sx={{ width: 32 }} />
    </Box>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Paper>
);

export default FormCard;
