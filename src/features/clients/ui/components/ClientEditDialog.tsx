import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Form, Formik } from "formik";
import { cpfMask, phoneMask } from "@/shared/lib/masks";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  toClientEditFormValues,
  toClientUpdateInput,
  validateClientEditForm,
  type Client,
  type ClientUpdateInput,
} from "../../domain/client";

interface ClientEditDialogProps {
  client: Client | null;
  onSubmit: (input: ClientUpdateInput) => Promise<boolean>;
  onClose: () => void;
}

const ADDRESS_FIELDS = [
  { name: "address.street", label: "Rua" },
  { name: "address.neighborhood", label: "Bairro" },
  { name: "address.city", label: "Cidade" },
  { name: "address.numberHouse", label: "Número" },
  { name: "address.reference", label: "Referência" },
];

const ClientEditDialog = ({
  client,
  onSubmit,
  onClose,
}: ClientEditDialogProps) => (
  <Dialog open={Boolean(client)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Editar cliente</DialogTitle>
    {client && (
      <Formik
        key={client.id}
        initialValues={toClientEditFormValues(client)}
        validate={validateClientEditForm}
        onSubmit={async (values) => {
          await onSubmit(toClientUpdateInput(values));
        }}
      >
        {({ isSubmitting }) => (
          <Form noValidate>
            <DialogContent dividers>
              <Box display="grid" gap={1.5} pt={0.5}>
                <FormTextField
                  name="name"
                  label="Nome completo"
                  labelPlacement="floating"
                />
                <FormTextField
                  name="cpf"
                  label="CPF"
                  labelPlacement="floating"
                  mask={cpfMask}
                  slotProps={{
                    htmlInput: { maxLength: 14, inputMode: "numeric" },
                  }}
                />
                <FormTextField
                  name="phone"
                  label="Telefone"
                  labelPlacement="floating"
                  mask={phoneMask}
                  slotProps={{
                    htmlInput: { maxLength: 15, inputMode: "numeric" },
                  }}
                />
                {ADDRESS_FIELDS.map((field) => (
                  <FormTextField
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    labelPlacement="floating"
                  />
                ))}
              </Box>
            </DialogContent>
            <FormDialogActions submitting={isSubmitting} onCancel={onClose} />
          </Form>
        )}
      </Formik>
    )}
  </Dialog>
);

export default ClientEditDialog;
