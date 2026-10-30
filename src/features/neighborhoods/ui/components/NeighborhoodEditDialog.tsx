import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import type { City } from "@/features/cities";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import {
  toNeighborhoodFormValues,
  type Neighborhood,
  type NeighborhoodInput,
} from "../../domain/neighborhood";
import NeighborhoodForm from "./NeighborhoodForm";

interface NeighborhoodEditDialogProps {
  neighborhood: Neighborhood | null;
  cities: City[];
  onSubmit: (input: NeighborhoodInput) => Promise<boolean>;
  onClose: () => void;
}

const NeighborhoodEditDialog = ({
  neighborhood,
  cities,
  onSubmit,
  onClose,
}: NeighborhoodEditDialogProps) => (
  <Dialog
    open={Boolean(neighborhood)}
    onClose={onClose}
    fullWidth
    maxWidth="xs"
  >
    <DialogTitle>Editar bairro</DialogTitle>
    {neighborhood && (
      <NeighborhoodForm
        key={neighborhood.id}
        initialValues={toNeighborhoodFormValues(neighborhood)}
        cities={cities}
        onSubmit={onSubmit}
      >
        {({ fields, submitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions submitting={submitting} onCancel={onClose} />
          </>
        )}
      </NeighborhoodForm>
    )}
  </Dialog>
);

export default NeighborhoodEditDialog;
