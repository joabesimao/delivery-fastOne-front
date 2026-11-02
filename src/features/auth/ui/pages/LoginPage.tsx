import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { ROUTES } from "@/shared/config/routes";
import useThemeMode from "@/shared/theme/useThemeMode";
import { useLogin } from "../../application/useLogin";
import LoginBrandPanel from "../components/LoginBrandPanel";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const { login, loading, error } = useLogin(() =>
    navigate(ROUTES.dashboardReports, { replace: true }),
  );

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
          {mode === "dark" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>

        <Grid container>
          <LoginBrandPanel />
          <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack
              spacing={3.5}
              sx={{ height: "100%", justifyContent: "center" }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Autenticação segura
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>
                  Entre na plataforma
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.25, maxWidth: 520 }}
                >
                  Use suas credenciais para acessar o painel de operações e
                  acompanhar o fluxo de entregas.
                </Typography>
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              <LoginForm
                loading={loading}
                onSubmit={(credentials) => void login(credentials)}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LoginPage;
