import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { cpfMask, phoneMask } from "@/shared/lib/masks";
import type { Client } from "../../domain/client";

interface ClientDetailsDialogProps {
  client: Client | null;
  onClose: () => void;
}

const ClientDetailsDialog = ({ client, onClose }: ClientDetailsDialogProps) => (
  <Dialog open={Boolean(client)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Detalhes do cliente</DialogTitle>
    <DialogContent dividers>
      {client && (
        <Box display="grid" gap={1.25}>
          {[
            ["Nome", client.name],
            ["CPF", client.cpf ? cpfMask(client.cpf) : "—"],
            ["Telefone", phoneMask(client.phone)],
            ["Status", client.active ? "Ativo" : "Inativo"],
            ["Rua", client.address?.street ?? "—"],
            ["Número", client.address?.numberHouse ?? "—"],
            ["Bairro", client.address?.neighborhood ?? "—"],
            ["Cidade", client.address?.city ?? "—"],
            ["Referência", client.address?.reference || "—"],
          ].map(([label, value]) => (
            <Typography key={label} variant="body2">
              <strong>{label}:</strong> {value}
            </Typography>
          ))}
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fechar</Button>
    </DialogActions>
  </Dialog>
);

export default ClientDetailsDialog;
