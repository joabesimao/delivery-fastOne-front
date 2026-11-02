import { useState, type FormEvent, type ReactNode } from "react";
import { Box, InputAdornment, Stack, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PasswordVisibilityToggle from "@/shared/ui/form/PasswordVisibilityToggle";
import {
  DEFAULT_CREDENTIALS,
  type LoginCredentials,
} from "../../domain/credentials";

interface LoginFormProps {
  loading: boolean;
  onSubmit: (credentials: LoginCredentials) => void;
}

const startIcon = (icon: ReactNode) => (
  <InputAdornment position="start">{icon}</InputAdornment>
);

const LoginForm = ({ loading, onSubmit }: LoginFormProps) => {
  const [credentials, setCredentials] = useState(DEFAULT_CREDENTIALS);
  const [showPassword, setShowPassword] = useState(false);

  const change = (changes: Partial<LoginCredentials>) =>
    setCredentials((current) => ({ ...current, ...changes }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(credentials);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.25}>
        <TextField
          label="Login"
          type="text"
          value={credentials.login}
          onChange={(event) => change({ login: event.target.value })}
          autoComplete="username"
          slotProps={{
            input: {
              startAdornment: startIcon(<EmailOutlinedIcon fontSize="small" />),
            },
          }}
        />
        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          value={credentials.password}
          onChange={(event) => change({ password: event.target.value })}
          autoComplete="current-password"
          slotProps={{
            input: {
              startAdornment: startIcon(<LockOutlinedIcon fontSize="small" />),
              endAdornment: (
                <PasswordVisibilityToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((visible) => !visible)}
                />
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
  );
};

export default LoginForm;
