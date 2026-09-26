import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import api from "../../../services/api";
import { ROLE_OPTIONS, type UsuarioItem, type UsuarioRole } from "../../../types/Usuario";

interface UsuarioFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  usuario?: UsuarioItem | null;
}

interface FormState {
  name: string;
  email: string;
  role: UsuarioRole;
  password: string;
  passwordConfirmation: string;
}

const buildInitialState = (usuario?: UsuarioItem | null): FormState => ({
  name: usuario?.name ?? "",
  email: usuario?.email ?? "",
  role: usuario?.role ?? "user",
  password: "",
  passwordConfirmation: "",
});

const UsuarioForm: React.FC<UsuarioFormProps> = ({ open, onClose, onSaved, usuario = null }) => {
  const isEdit = Boolean(usuario);

  const [values, setValues] = useState<FormState>(() => buildInitialState(usuario));
  const [resetPassword, setResetPassword] = useState(!isEdit);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open) {
      setValues(buildInitialState(usuario));
      setResetPassword(!usuario);
      setShowPassword(false);
      setShowPasswordConfirmation(false);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, usuario?.id]);

  const handleChange =
    (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!values.name.trim()) nextErrors.name = "Informe o nome.";
    if (!values.email.trim()) nextErrors.email = "Informe o e-mail.";

    const wantsPassword = !isEdit || resetPassword;
    if (wantsPassword) {
      if (!values.password) nextErrors.password = "Informe a senha.";
      else if (values.password.length < 6) nextErrors.password = "A senha deve ter ao menos 6 caracteres.";

      if (!values.passwordConfirmation) nextErrors.passwordConfirmation = "Confirme a senha.";
      else if (values.password !== values.passwordConfirmation)
        nextErrors.passwordConfirmation = "As senhas não coincidem.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && usuario) {
        const payload: Record<string, unknown> = {
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
        };
        if (resetPassword) {
          payload.password = values.password;
          payload.passwordConfirmation = values.passwordConfirmation;
        }
        await api.put(`/account/${usuario.id}`, payload);
      } else {
        await api.post("/account/staff", {
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
        });
      }

      onSaved();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        `Erro ao ${isEdit ? "atualizar" : "cadastrar"} usuário. Tente novamente.`;
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const showPasswordFields = !isEdit || resetPassword;

  return (
    <>
      <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Nome"
              size="small"
              fullWidth
              value={values.name}
              onChange={handleChange("name")}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
            <TextField
              label="E-mail"
              size="small"
              fullWidth
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              select
              label="Papel"
              size="small"
              fullWidth
              value={values.role}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, role: event.target.value as UsuarioRole }))
              }
            >
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {isEdit ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={resetPassword}
                    onChange={(event) => setResetPassword(event.target.checked)}
                  />
                }
                label="Redefinir senha"
              />
            ) : null}

            {showPasswordFields ? (
              <>
                <TextField
                  label="Senha"
                  size="small"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange("password")}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  autoComplete="new-password"
                  slotProps={{
                    input: {
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
                <TextField
                  label="Confirmar senha"
                  size="small"
                  fullWidth
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={values.passwordConfirmation}
                  onChange={handleChange("passwordConfirmation")}
                  error={Boolean(errors.passwordConfirmation)}
                  helperText={errors.passwordConfirmation}
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={showPasswordConfirmation ? "Ocultar senha" : "Mostrar senha"}>
                            <IconButton
                              onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                              edge="end"
                              size="small"
                              aria-label={showPasswordConfirmation ? "Ocultar senha" : "Mostrar senha"}
                            >
                              {showPasswordConfirmation ? (
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
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default UsuarioForm;
