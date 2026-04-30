import {
  Dialog,
  DialogTitle,
  Divider,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { ReactNode } from "react";

export interface ViewUsersProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm?: () => void;
  children?: ReactNode;
  isLoading?: boolean;
  title?: string;
  textButtonClose?: string;
}

const ModalConfirm = (props: ViewUsersProps) => {
  const {
    handleClose,
    open,
    handleConfirm,
    children,
    isLoading,
    title = "Visualizar informações",
    textButtonClose,
  } = props;
  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={600} textAlign="center">
        {title}
      </DialogTitle>
      <Divider />
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 3 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#D9D9D9",
            color: "#6C757D",
            "&:hover": {
              bgcolor: "#c4c4c4",
            },
          }}
          onClick={() => {
            handleClose();
          }}
        >
          {textButtonClose ? textButtonClose : "Fechar"}
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#07A7DF",
            color: "#fff",
            "&:hover": {
              bgcolor: "#0693c5",
            },
          }}
          disabled={isLoading}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ModalConfirm;