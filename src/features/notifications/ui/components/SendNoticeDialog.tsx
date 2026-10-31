import { useMemo } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from "@mui/material";
import { Form, Formik } from "formik";
import { extractApiErrorMessage } from "@/shared/lib/errors/extractApiErrorMessage";
import { getRealtimeSessionUnits } from "@/shared/realtime/realtimeSocket";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  EMPTY_NOTICE,
  NOTICE_BODY_MAX,
  NOTICE_TITLE_MAX,
  toBroadcastPayload,
  validateNotice,
  type NoticeFormValues,
} from "../../domain/notice";
import { useBroadcastNotice } from "../../application/useBroadcastNotice";
import NoticeRolesField from "./NoticeRolesField";

interface SendNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  onSent: (recipients: number) => void;
}

const SendNoticeDialog = ({ open, onClose, onSent }: SendNoticeDialogProps) => {
  const units = useMemo(() => (open ? getRealtimeSessionUnits() : []), [open]);
  const broadcast = useBroadcastNotice();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik<NoticeFormValues>
        initialValues={EMPTY_NOTICE}
        validate={validateNotice}
        onSubmit={async (values, { setStatus, resetForm }) => {
          setStatus(undefined);
          try {
            const recipients = await broadcast.mutateAsync(
              toBroadcastPayload(values),
            );
            resetForm();
            onSent(recipients);
          } catch (error) {
            setStatus(
              extractApiErrorMessage(error, "Não foi possível enviar o aviso."),
            );
          }
        }}
      >
        {({ values, isSubmitting, status }) => (
          <Form noValidate>
            <DialogTitle>Enviar aviso</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {status && <Alert severity="error">{status}</Alert>}
                <FormTextField
                  name="title"
                  label="Título"
                  labelPlacement="floating"
                  size="medium"
                  slotProps={{ htmlInput: { maxLength: NOTICE_TITLE_MAX } }}
                  autoFocus
                />
                <FormTextField
                  name="body"
                  label="Mensagem"
                  labelPlacement="floating"
                  size="medium"
                  helperText={`${values.body.length}/${NOTICE_BODY_MAX}`}
                  slotProps={{ htmlInput: { maxLength: NOTICE_BODY_MAX } }}
                  multiline
                  minRows={3}
                />
                <NoticeRolesField name="roles" />
                <FormTextField
                  select
                  name="unitStoreId"
                  label="Unidade"
                  labelPlacement="floating"
                  size="medium"
                  helperText={
                    units.length
                      ? undefined
                      : "Unidades indisponíveis: o aviso vai para todas."
                  }
                  disabled={units.length === 0}
                >
                  <MenuItem value="">Todas as unidades</MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </FormTextField>
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
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
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
