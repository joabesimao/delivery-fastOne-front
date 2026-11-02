import { Button, CircularProgress, DialogActions } from "@mui/material";

import { COLORS } from "@/shared/theme/colors";
interface FormDialogActionsProps {
  submitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

const FormDialogActions = ({
  submitting,
  onCancel,
  submitLabel = "Salvar",
}: FormDialogActionsProps) => (
  <DialogActions>
    <Button onClick={onCancel}>Cancelar</Button>
    <Button type="submit" variant="contained" disabled={submitting}>
      {submitting ? (
        <CircularProgress size={20} sx={{ color: COLORS.white }} />
      ) : (
        submitLabel
      )}
    </Button>
  </DialogActions>
);

export default FormDialogActions;
