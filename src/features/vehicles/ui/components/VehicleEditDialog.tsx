import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import type { DeliverymanSummary } from "@/features/deliverymen";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import {
  toVehicleFormValues,
  type Vehicle,
  type VehicleInput,
} from "../../domain/vehicle";
import VehicleForm from "./VehicleForm";

interface VehicleEditDialogProps {
  vehicle: Vehicle | null;
  deliverymen: DeliverymanSummary[];
  onSubmit: (input: VehicleInput) => Promise<boolean>;
  onClose: () => void;
}

const VehicleEditDialog = ({
  vehicle,
  deliverymen,
  onSubmit,
  onClose,
}: VehicleEditDialogProps) => (
  <Dialog open={Boolean(vehicle)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Editar veículo</DialogTitle>
    {vehicle && (
      <VehicleForm
        key={vehicle.id}
        initialValues={toVehicleFormValues(vehicle)}
        deliverymen={deliverymen}
        onSubmit={onSubmit}
      >
        {({ fields, submitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions submitting={submitting} onCancel={onClose} />
          </>
        )}
      </VehicleForm>
    )}
  </Dialog>
);

export default VehicleEditDialog;
