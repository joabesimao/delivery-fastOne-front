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
import {
  deliverymanFullName,
  type Deliveryman,
} from "../../domain/deliveryman";

interface DeliverymanDetailsDialogProps {
  deliveryman: Deliveryman | null;
  onClose: () => void;
}

const DeliverymanDetailsDialog = ({
  deliveryman,
  onClose,
}: DeliverymanDetailsDialogProps) => (
  <Dialog open={Boolean(deliveryman)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Detalhes do entregador</DialogTitle>
    <DialogContent dividers>
      {deliveryman && (
        <Box display="grid" gap={1.25}>
          {[
            ["Nome", deliverymanFullName(deliveryman)],
            ["Telefone", phoneMask(deliveryman.phone)],
            ["CPF", deliveryman.cpf ? cpfMask(deliveryman.cpf) : "—"],
            ["Habilitação", deliveryman.numberQualification],
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

export default DeliverymanDetailsDialog;
