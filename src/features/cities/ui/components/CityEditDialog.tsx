import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import { toCityFormValues, type City, type CityInput } from "../../domain/city";
import CityForm from "./CityForm";

interface CityEditDialogProps {
  city: City | null;
  onSubmit: (input: CityInput) => Promise<boolean>;
  onClose: () => void;
}

const CityEditDialog = ({ city, onSubmit, onClose }: CityEditDialogProps) => (
  <Dialog open={Boolean(city)} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Editar cidade</DialogTitle>
    {city && (
      <CityForm
        key={city.id}
        initialValues={toCityFormValues(city)}
        onSubmit={onSubmit}
      >
        {({ fields, submitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions submitting={submitting} onCancel={onClose} />
          </>
        )}
      </CityForm>
    )}
  </Dialog>
);

export default CityEditDialog;
