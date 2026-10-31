import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import type { SelectOption } from "@/shared/ui/form/FormSelectField";
import {
  oilChangeInterval,
  toOilChangeFormValues,
  type OilChange,
  type OilChangeInput,
} from "../../domain/oilChange";
import OilChangeForm from "./OilChangeForm";

interface OilChangeEditDialogProps {
  oilChange: OilChange | null;
  vehicleOptions: SelectOption[];
  deliverymanOptions: SelectOption[];
  onSubmit: (input: OilChangeInput) => Promise<boolean>;
  onClose: () => void;
}

const OilChangeEditDialog = ({
  oilChange,
  vehicleOptions,
  deliverymanOptions,
  onSubmit,
  onClose,
}: OilChangeEditDialogProps) => (
  <Dialog open={Boolean(oilChange)} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Editar troca de óleo</DialogTitle>
    {oilChange && (
      <OilChangeForm
        key={oilChange.id}
        initialValues={toOilChangeFormValues(oilChange)}
        vehicleOptions={vehicleOptions}
        deliverymanOptions={deliverymanOptions}
        nextChangeInterval={oilChangeInterval(oilChange)}
        onSubmit={onSubmit}
      >
        {({ fields, submitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions submitting={submitting} onCancel={onClose} />
          </>
        )}
      </OilChangeForm>
    )}
  </Dialog>
);

export default OilChangeEditDialog;
