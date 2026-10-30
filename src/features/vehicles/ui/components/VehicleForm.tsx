import type { ReactNode } from "react";
import { Grid, MenuItem } from "@mui/material";
import { Form, Formik } from "formik";
import {
  deliverymanFullName,
  type DeliverymanSummary,
} from "@/features/deliverymen";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  toVehicleInput,
  validateVehicleForm,
  type VehicleFormValues,
  type VehicleInput,
} from "../../domain/vehicle";

interface VehicleFormProps {
  initialValues: VehicleFormValues;
  deliverymen: DeliverymanSummary[];
  onSubmit: (input: VehicleInput) => Promise<boolean>;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const VehicleForm = ({
  initialValues,
  deliverymen,
  onSubmit,
  resetOnSuccess = false,
  children,
}: VehicleFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={validateVehicleForm}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(toVehicleInput(values));
      if (succeeded && resetOnSuccess) resetForm();
    }}
  >
    {({ isSubmitting }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="plate"
                  label="Placa *"
                  placeholder="Ex: ABC1D23"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="model"
                  label="Modelo *"
                  placeholder="Ex: CG 160"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="brand"
                  label="Marca"
                  placeholder="Ex: Honda"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  select
                  name="deliverymanId"
                  label="Entregador"
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {deliverymen.map((deliveryman) => (
                    <MenuItem
                      key={deliveryman.id}
                      value={String(deliveryman.id)}
                    >
                      {deliverymanFullName(deliveryman)}
                    </MenuItem>
                  ))}
                </FormTextField>
              </Grid>
            </Grid>
          ),
        })}
      </Form>
    )}
  </Formik>
);

export default VehicleForm;
