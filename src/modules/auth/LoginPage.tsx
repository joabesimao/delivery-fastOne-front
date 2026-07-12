import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import useThemeMode from "../../hooks/useThemeMode";

const DEFAULT_LOGIN = import.meta.env.VITE_DEFAULT_LOGIN ?? "admin@fastone.local";
const DEFAULT_PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD ?? "123456";

const LoginPage = () => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const [email, setEmail] = useState(DEFAULT_LOGIN);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveTokensAndEnter = (
    accessToken: string,
    userEmail: string,
    refreshToken?: string,
  ) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("currentUserEmail", userEmail);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
    navigate("/dashboard/relatorios", { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Informe login e senha.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<{ accessToken?: string; refreshToken?: string }>(
        "/login",
        {
          email: normalizedEmail,
          password,
        },
      );

      if (response.data?.accessToken) {
        saveTokensAndEnter(
          response.data.accessToken,
          normalizedEmail,
          response.data.refreshToken,
        );
        return;
      }

      setError("Nao foi possivel autenticar com as credenciais informadas.");
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const apiMessage =
        (error as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ||
        (error as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.message;

      if (status === 401) {
        setError(
          `Credenciais inválidas. Use ${DEFAULT_LOGIN} / ${DEFAULT_PASSWORD}. Se acabou de resetar banco, rode o seed.`,
        );
      } else {
        setError(apiMessage || "Login ou senha invalidos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
        display: "grid",
        placeItems: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1180,
          overflow: "hidden",
          borderRadius: 5,
          position: "relative",
        }}
      >
        <IconButton
          onClick={toggleMode}
          aria-label="Alternar tema"
          sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}
        >
          {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        <Grid container>
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { md: 680 },
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 32%), radial-gradient(circle at bottom left, rgba(14,165,233,0.22), transparent 26%)",
              }}
            />

            <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <LocalShippingOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    FastOne Delivery
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.86 }}>
                    Modern operations cockpit
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="h3" sx={{ mb: 2, maxWidth: 420 }}>
                  Gestão de entregas com visual SaaS profissional.
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.88, maxWidth: 430 }}>
                  Acesse relatórios, cadastros e fluxos operacionais em uma interface limpa,
                  rápida e preparada para light e dark mode.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
                <Chip label="Responsivo" color="default" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "inherit" }} />
                <Chip label="MUI v7" color="default" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "inherit" }} />
                <Chip label="Dark mode" color="default" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "inherit" }} />
              </Stack>

              <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ShieldOutlinedIcon fontSize="small" />
                  <Typography variant="body2">Controle de acesso e sessão</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <QueryStatsOutlinedIcon fontSize="small" />
                  <Typography variant="body2">Indicadores e relatórios centralizados</Typography>
                </Stack>
              </Stack>
            </Stack>

            <Typography variant="caption" sx={{ mt: 4, position: "relative", zIndex: 1, opacity: 0.8 }}>
              Ambiente de demonstração com credenciais padrão para acesso inicial.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack spacing={3.5} sx={{ height: "100%", justifyContent: "center" }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Autenticação segura
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>
                  Entre na plataforma
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, maxWidth: 520 }}>
                  Use suas credenciais para acessar o painel de operações e acompanhar o fluxo de entregas.
                </Typography>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.25}>
                  <TextField
                    label="Login"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={loading}
                    loadingPosition="start"
                    fullWidth
                    sx={{ py: 1.4 }}
                  >
                    Entrar
                  </LoadingButton>
                </Stack>
              </Box>

              <Divider />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Credenciais padrão
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {DEFAULT_LOGIN} / {DEFAULT_PASSWORD}
                  </Typography>
                </Box>

                <Button
                  variant="text"
                  onClick={() => {
                    setEmail(DEFAULT_LOGIN);
                    setPassword(DEFAULT_PASSWORD);
                  }}
                >
                  Preencher credenciais padrão
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LoginPage;
