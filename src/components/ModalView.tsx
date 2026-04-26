import React from "react";
import { Modal, Box, Typography, Button, Divider, Stack } from "@mui/material";

interface ModalViewProps {
  open: boolean;
  handleClose: () => void;
  data?: Record<string, any> | null;
  title?: string;
}

const ModalView: React.FC<ModalViewProps> = ({
  open,
  handleClose,
  data,
  title = "Detalhes",
}) => {
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Cnh", "CNH")
      .replace("Cpf", "CPF")
      .replace("Rg", "RG");
  };

  const formatValue = (key: string, value: any) => {
    if (typeof value !== "string") return value;

    if (
      key.toLowerCase().includes("data") ||
      key.toLowerCase().includes("validade")
    ) {
      return new Date(value).toLocaleDateString("pt-BR");
    }

    if (key.toLowerCase().includes("telefone") && value.length >= 11) {
      return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return value;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {title}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {data ? (
          <Stack spacing={2}>
            {Object.entries(data).map(([key, value]) => (
              <Box key={key}>
                <Typography variant="subtitle2" color="text.secondary">
                  {formatKey(key)}
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                  {formatValue(key, value) || "-"}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Nenhuma informação disponível.
          </Typography>
        )}

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleClose}
            sx={{ px: 4 }}
          >
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalView;
