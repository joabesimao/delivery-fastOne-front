import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GlobalInput from "../InputComponent";

export interface ModalConfirmActionProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  title: string;
  subtitle: string;
  confirmText?: string;
  isLoading?: boolean;
}

const ModalConfirmAction: React.FC<ModalConfirmActionProps> = ({
  open,
  handleClose,
  handleConfirm,
  title,
  subtitle,
  confirmText = "DESATIVAR",
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(false);
  };

  const handleConfirmClick = () => {
    if (inputValue.trim().toUpperCase() === confirmText.toUpperCase()) {
      handleConfirm();
      setInputValue("");
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleCloseModal = () => {
    setInputValue("");
    setError(false);
    handleClose();
  };

  const isConfirmDisabled =
    inputValue.trim().toUpperCase() !== confirmText.toUpperCase() || isLoading;

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ErrorOutlineIcon sx={{ fontSize: 95, color: "#FF4043" }} />
        </Box>

        <Typography
          variant="h6"
          textAlign="center"
          color="#181C32"
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mb: 3, fontSize: "14px", color: "#6C757D" }}
        >
          {subtitle}
        </Typography>

        <GlobalInput
          required
          name="conform-text"
          label={`Caso confirme a ação, digite a palavra "${confirmText}"`}
          placeholder="Digite aqui"
          value={inputValue}
          onChange={handleInputChange}
          error={error}
          helperText={
            error ? `Por favor, digite exatamente "${confirmText}"` : ""
          }
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 3 }}>
        <Button
          variant="contained"
          onClick={handleCloseModal}
          disabled={isLoading}
          sx={{
            bgcolor: "#D9D9D9",
            color: "#6C757D",
            "&:hover": {
              bgcolor: "#c4c4c4",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmClick}
          disabled={isConfirmDisabled}
          sx={{
            bgcolor: "#07A7DF",
            color: "#fff",
            "&:hover": {
              bgcolor: "#0693c5",
            },
          }}
        >
          {isLoading ? "Confirmando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalConfirmAction;
