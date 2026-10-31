import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import {
  toDeliverymanFormValues,
  type Deliveryman,
  type DeliverymanInput,
  type RegisteredDocuments,
} from "../../domain/deliveryman";
import DeliverymanForm from "./DeliverymanForm";

interface DeliverymanEditDialogProps {
  deliveryman: Deliveryman | null;
  registeredDocuments: RegisteredDocuments;
  onSubmit: (input: DeliverymanInput) => Promise<boolean>;
  onClose: () => void;
}

const DeliverymanEditDialog = ({
  deliveryman,
  registeredDocuments,
  onSubmit,
  onClose,
}: DeliverymanEditDialogProps) => (
  <Dialog open={Boolean(deliveryman)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Editar entregador</DialogTitle>
    {deliveryman && (
      <DeliverymanForm
        key={deliveryman.id}
        initialValues={toDeliverymanFormValues(deliveryman)}
        registeredDocuments={registeredDocuments}
        requireCpf={false}
        onSubmit={onSubmit}
      >
        {({ fields, submitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions submitting={submitting} onCancel={onClose} />
          </>
        )}
      </DeliverymanForm>
    )}
  </Dialog>
);

export default DeliverymanEditDialog;
