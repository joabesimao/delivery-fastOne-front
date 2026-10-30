import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import type { SelectOption } from "@/shared/ui/form/FormSelectField";
import {
  toFuelRefillFormValues,
  type FuelRefill,
  type FuelRefillInput,
} from "../../domain/fuelRefill";
import FuelRefillForm from "./FuelRefillForm";

interface FuelRefillEditDialogProps {
  refill: FuelRefill | null;
  vehicleOptions: SelectOption[];
  deliverymanOptions: SelectOption[];
  onSubmit: (input: FuelRefillInput) => Promise<boolean>;
  onClose: () => void;
}

const FuelRefillEditDialog = ({
  refill,
  vehicleOptions,
  deliverymanOptions,
  onSubmit,
  onClose,
}: FuelRefillEditDialogProps) => (
  <Dialog open={Boolean(refill)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Editar abastecimento</DialogTitle>
    {refill && (
      <FuelRefillForm
        key={refill.id}
        initialValues={toFuelRefillFormValues(refill)}
        vehicleOptions={vehicleOptions}
        deliverymanOptions={deliverymanOptions}
        onSubmit={onSubmit}
      >
        {({ fields, submitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions submitting={submitting} onCancel={onClose} />
          </>
        )}
      </FuelRefillForm>
    )}
  </Dialog>
);

export default FuelRefillEditDialog;
