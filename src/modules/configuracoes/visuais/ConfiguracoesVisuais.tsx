import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import useThemeMode from "../../../hooks/useThemeMode";

// Switch estilo iOS / mobile
const MobileSwitch = styled(Switch)(({ theme }) => ({
  width: 58,
  height: 32,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 3,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(26px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#4361EE",
        opacity: 1,
        border: 0,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#4361EE",
      border: "6px solid #fff",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 26,
    height: 26,
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 32 / 2,
    backgroundColor: theme.palette.mode === "dark" ? "#555" : "#C4C9D4",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const ConfiguracoesVisuais: React.FC = () => {
  const { mode, toggleMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const isDark = mode === "dark";

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 720,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, textAlign: "center", color: "text.primary" }}>
          Configurações visuais
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Stack spacing={3}>
          {/* Card tema */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isDark ? (
                <DarkModeIcon sx={{ color: "#4361EE", fontSize: 28 }} />
              ) : (
                <LightModeIcon sx={{ color: "#F59E0B", fontSize: 28 }} />
              )}
              <Box>
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  Tema do sistema
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isDark ? "Modo escuro ativado" : "Modo claro ativado"}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpen(true)}
              sx={{
                textTransform: "none",
                borderColor: "#4361EE",
                color: "#4361EE",
                "&:hover": { bgcolor: "#E8ECFF" },
              }}
            >
              Alterar
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 360,
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          Tema
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Stack spacing={3} alignItems="center">
            {/* Preview visual */}
            <Box
              sx={{
                width: 200,
                height: 120,
                borderRadius: 2,
                border: "2px solid",
                borderColor: isDark ? "#4361EE" : "#C4C9D4",
                bgcolor: isDark ? "#121212" : "#F4F6F8",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                transition: "all 0.3s ease",
              }}
            >
              {isDark ? (
                <DarkModeIcon sx={{ color: "#4361EE", fontSize: 40 }} />
              ) : (
                <LightModeIcon sx={{ color: "#F59E0B", fontSize: 40 }} />
              )}
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: isDark ? "#E2E4E9" : "#1A1D23" }}
              >
                {isDark ? "Modo escuro" : "Modo claro"}
              </Typography>
            </Box>

            {/* Toggle switch */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(67,97,238,0.08)" : "#F4F6F8",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <LightModeIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  Claro
                </Typography>
              </Stack>

              <FormControlLabel
                control={
                  <MobileSwitch
                    checked={isDark}
                    onChange={toggleMode}
                    inputProps={{ "aria-label": "alternar tema" }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  Escuro
                </Typography>
                <DarkModeIcon sx={{ color: "#4361EE", fontSize: 20 }} />
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              A preferência é salva automaticamente no seu navegador.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfiguracoesVisuais;
