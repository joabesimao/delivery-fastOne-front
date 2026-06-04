import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const DEFAULT_LOGIN = import.meta.env.VITE_DEFAULT_LOGIN ?? "admin@fastone.local";
const DEFAULT_PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD ?? "123456";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEFAULT_LOGIN);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canTryDefaultLogin = useMemo(
    () => email.trim() === DEFAULT_LOGIN && password === DEFAULT_PASSWORD,
    [email, password],
  );

  const saveTokensAndEnter = (
    accessToken: string,
    userEmail: string,
    refreshToken?: string,
  ) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("currentUserEmail", userEmail);
    localStorage.setItem(
      "refreshToken",
      refreshToken || `static-refresh-${Date.now()}`,
    );
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

      if (canTryDefaultLogin) {
        saveTokensAndEnter(`static-${Date.now()}`, normalizedEmail);
        return;
      }

      setError("Nao foi possivel autenticar com as credenciais informadas.");
    } catch {
      if (canTryDefaultLogin) {
        saveTokensAndEnter(`static-${Date.now()}`, normalizedEmail);
        return;
      }

      setError("Login ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          "radial-gradient(1100px 500px at -20% -15%, rgba(14,165,233,0.35), transparent 60%), radial-gradient(900px 500px at 115% 115%, rgba(16,185,129,0.24), transparent 62%), linear-gradient(180deg, #f6fbff 0%, #eef6ff 38%, #f6f8fc 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 30px 70px rgba(17, 24, 39, 0.12)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
          Delivery FastOne
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Entre para acessar os relatorios de entregas.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Login"
            type="email"
            size="small"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            size="small"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.1,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
            }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2.5 }}>
          Credenciais padrao temporarias: {DEFAULT_LOGIN} / {DEFAULT_PASSWORD}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
