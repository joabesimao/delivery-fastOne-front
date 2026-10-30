import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface OfferDeliveryDialogProps {
  clientName: string | null;
  onAccept: () => void;
  onDecline: () => void;
}

const OfferDeliveryDialog = ({
  clientName,
  onAccept,
  onDecline,
}: OfferDeliveryDialogProps) => (
  <Dialog open={clientName !== null} onClose={onDecline}>
    <DialogTitle sx={{ fontWeight: 700 }}>Realizar entrega?</DialogTitle>
    <DialogContent>
      <Typography sx={{ mt: 1 }}>
        Deseja realizar uma entrega para o cliente <strong>{clientName}</strong>
        ?
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={onDecline}
        variant="outlined"
        sx={{ textTransform: "none" }}
      >
        Não
      </Button>
      <Button
        onClick={onAccept}
        variant="contained"
        sx={{
          textTransform: "none",
          bgcolor: "#4361EE",
          "&:hover": { bgcolor: "#3451D1" },
        }}
      >
        Sim
      </Button>
    </DialogActions>
  </Dialog>
);

export default OfferDeliveryDialog;
