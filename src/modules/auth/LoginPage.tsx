import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, LocalShipping } from "@mui/icons-material";
import { isAuthenticated, setAccessToken } from "@/utils/authSession";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isAuthenticated()) {
    return <Navigate to="/relatorios-entregas" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const devToken = "dev-session-token";
    setAccessToken(devToken);

    window.setTimeout(() => {
      setLoading(false);
      navigate(from || "/relatorios-entregas", { replace: true });
    }, 250);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        background:
          "radial-gradient(circle at top left, rgba(67,97,238,0.14), transparent 30%), linear-gradient(180deg, #f6f8fe 0%, #eef3fb 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          gap: { xs: 2, md: 4 },
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            p: { xs: 3, sm: 4, md: 6 },
            color: "#FFFFFF",
            background:
              "linear-gradient(135deg, #1D4ED8 0%, #4361EE 42%, #0EA5E9 100%)",
            boxShadow: "0 25px 60px rgba(67,97,238,0.24)",
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: 260, md: 520 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              right: -100,
              top: -100,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.16)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <LocalShipping sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} lineHeight={1}>
                  FastOne
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Gestão de entregas com visão clara e rápida.
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                lineHeight: 1.05,
                maxWidth: 440,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              Acesse os relatórios e acompanhe suas entregas.
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 2, maxWidth: 520, opacity: 0.92, lineHeight: 1.7 }}
            >
              Entre com sua conta para continuar no painel principal, visualizar
              relatórios e acessar as demais áreas do sistema com segurança.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ position: "relative", zIndex: 1, mt: 4 }}>
            {[
              ["Conforto visual", "Modo claro ajustado"],
              ["Segurança", "Sessão com token"],
              ["Responsivo", "Desktop e mobile"],
            ].map(([title, subtitle]) => (
              <Card
                key={title}
                sx={{
                  flex: 1,
                  bgcolor: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {subtitle}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 20px 50px rgba(46, 70, 116, 0.08)",
            alignSelf: "center",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 1 }}>
              Acesso
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
              Entrar no sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              Use seu e-mail e senha para acessar o painel.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.2}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.8, color: "text.secondary" }}>
                    E-mail
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.8, color: "text.secondary" }}>
                    Senha
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label="alternar senha"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 1,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;