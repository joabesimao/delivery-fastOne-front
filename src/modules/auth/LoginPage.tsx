import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";
import useThemeMode from "../../hooks/useThemeMode";
import api from "../../services/api";

const DEFAULT_LOGIN = import.meta.env.VITE_DEFAULT_LOGIN ?? "admin";
const DEFAULT_PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD ?? "12345678";
const ADMIN_TECH_EMAIL = "admin@fastone.local";

const normalizeUserLabel = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";

  if (normalized === "admin" || normalized === ADMIN_TECH_EMAIL) {
    return "admin";
  }

  return value.trim();
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const [email, setEmail] = useState(DEFAULT_LOGIN);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const saveTokensAndEnter = (
    accessToken: string,
    userEmail: string,
    refreshToken?: string,
    role?: string,
    name?: string,
  ) => {
    const userLabel = normalizeUserLabel(userEmail);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("currentUserEmail", userLabel || userEmail);
    localStorage.setItem("currentUserName", name || userLabel || userEmail);
    localStorage.setItem(
      "refreshToken",
      refreshToken || `static-refresh-${Date.now()}`,
    );
    localStorage.setItem("currentUserRole", role || "user");
    navigate("/dashboard/relatorios", { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedLogin = email.trim();

    if (!normalizedLogin || !password) {
      setError("Informe login e senha.");
      return;
    }

    const normalizedEmail =
      normalizedLogin.toLowerCase() === "admin" ? ADMIN_TECH_EMAIL : normalizedLogin;

    setLoading(true);

    try {
      const response = await api.post<{
        accessToken?: string;
        refreshToken?: string;
        name?: string;
        role?: string;
      }>(
        "/login",
        {
          email: normalizedEmail,
          password,
        },
      );

      if (response.data?.accessToken) {
        saveTokensAndEnter(
          response.data.accessToken,
          normalizedLogin,
          response.data.refreshToken,
          response.data.role,
          response.data.name,
        );
        return;
      }

      setError("Nao foi possivel autenticar com as credenciais informadas.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ??
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.message ??
        "Login ou senha invalidos.";

      setError(msg);
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
              justifyContent: "center",
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
            </Stack>
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
                    type="text"
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
                    type={showPassword ? "text" : "password"}
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
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                              <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                                size="small"
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon fontSize="small" />
                                ) : (
                                  <VisibilityOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
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
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LoginPage;
