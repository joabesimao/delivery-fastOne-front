import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import api from "../../../services/api";
import { extractApiErrorMessage } from "../../../helpers/extractApiErrorMessage";

interface OilChangeConfigResponse {
  id: number;
  intervalKm: number;
}

const ConfiguracoesFrota: React.FC = () => {
  const [intervalKm, setIntervalKm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    api
      .get<OilChangeConfigResponse>("/oil-change-config")
      .then((res) => setIntervalKm(String(res.data?.intervalKm ?? "")))
      .catch(() => setSnackbar({ open: true, message: "Erro ao carregar configuração.", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const parsed = Number(intervalKm);
    if (!intervalKm || Number.isNaN(parsed) || parsed <= 0) {
      setSnackbar({ open: true, message: "Informe um intervalo de km válido.", severity: "error" });
      return;
    }

    try {
      setSaving(true);
      await api.put("/oil-change-config", { intervalKm: parsed });
      setSnackbar({ open: true, message: "Configuração salva com sucesso!", severity: "success" });
    } catch (err) {
      setSnackbar({
        open: true,
        message: extractApiErrorMessage(err, "Erro ao salvar configuração. Tente novamente."),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

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
          Configurações de frota
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
                flexWrap: "wrap",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BuildIcon sx={{ color: "#4361EE", fontSize: 28 }} />
                <Box>
                  <Typography variant="body1" fontWeight={600} color="text.primary">
                    Intervalo de troca de óleo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Km utilizado para calcular a próxima troca em todos os veículos.
                  </Typography>
                </Box>
              </Stack>
              <TextField
                size="small"
                type="number"
                slotProps={{ htmlInput: { min: 1 } }}
                value={intervalKm}
                onChange={(e) => setIntervalKm(e.target.value)}
                sx={{ width: 140 }}
                label="Km"
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={saving}
                onClick={() => void handleSave()}
                sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" } }}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </Box>
          </Stack>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfiguracoesFrota;
