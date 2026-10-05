import { useMemo } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Form, Formik } from "formik";
import { broadcastNotice } from "../../services/notifications";
import { getRealtimeSessionUnits } from "../../services/realtime";
import { extractApiErrorMessage } from "../../helpers/extractApiErrorMessage";
import { ROLE_OPTIONS, type UsuarioRole } from "../../types/Usuario";

const TITLE_MAX = 191;
const BODY_MAX = 2000;

interface NoticeFormValues {
  title: string;
  body: string;
  roles: UsuarioRole[];
  unitStoreId: string;
}

type FormErrors = Partial<Record<keyof NoticeFormValues, string>>;

const initialValues: NoticeFormValues = { title: "", body: "", roles: [], unitStoreId: "" };

const validate = (values: NoticeFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = "Informe o título.";
  else if (values.title.trim().length > TITLE_MAX) errors.title = `Máximo de ${TITLE_MAX} caracteres.`;
  if (!values.body.trim()) errors.body = "Escreva a mensagem.";
  else if (values.body.trim().length > BODY_MAX) errors.body = `Máximo de ${BODY_MAX} caracteres.`;
  return errors;
};

const roleLabel = (role: UsuarioRole) => ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;

interface SendNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  onSent: (recipients: number) => void;
}

const SendNoticeDialog = ({ open, onClose, onSent }: SendNoticeDialogProps) => {
  // Lidas a cada abertura: chegam pelo session:ready do socket.
  const units = useMemo(() => (open ? getRealtimeSessionUnits() : []), [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik<NoticeFormValues>
        initialValues={initialValues}
        validate={validate}
        onSubmit={async (values, { setStatus, resetForm }) => {
          setStatus(undefined);
          try {
            const recipients = await broadcastNotice({
              title: values.title.trim(),
              body: values.body.trim(),
              roles: values.roles.length ? values.roles : undefined,
              unitStoreId: values.unitStoreId ? Number(values.unitStoreId) : undefined,
            });
            resetForm();
            onSent(recipients);
          } catch (error) {
            setStatus(extractApiErrorMessage(error, "Não foi possível enviar o aviso."));
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form noValidate>
            <DialogTitle>Enviar aviso</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {status ? <Alert severity="error">{status}</Alert> : null}
                <TextField
                  name="title"
                  label="Título"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                  slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
                  autoFocus
                  fullWidth
                />
                <TextField
                  name="body"
                  label="Mensagem"
                  value={values.body}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.body && errors.body)}
                  helperText={(touched.body && errors.body) || `${values.body.length}/${BODY_MAX}`}
                  slotProps={{ htmlInput: { maxLength: BODY_MAX } }}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <TextField
                  select
                  name="roles"
                  label="Perfis"
                  value={values.roles}
                  onChange={(event) => {
                    const value = event.target.value as unknown as UsuarioRole[] | string;
                    void setFieldValue("roles", typeof value === "string" ? value.split(",") : value);
                  }}
                  helperText="Vazio = todos os perfis"
                  slotProps={{
                    select: {
                      multiple: true,
                      renderValue: (selected) => (
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          {(selected as UsuarioRole[]).map((role) => (
                            <Chip key={role} label={roleLabel(role)} size="small" />
                          ))}
                        </Stack>
                      ),
                    },
                  }}
                  fullWidth
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  name="unitStoreId"
                  label="Unidade"
                  value={values.unitStoreId}
                  onChange={handleChange}
                  helperText={units.length ? undefined : "Unidades indisponíveis: o aviso vai para todas."}
                  disabled={units.length === 0}
                  fullWidth
                >
                  <MenuItem value="">Todas as unidades</MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                Enviar
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default SendNoticeDialog;
