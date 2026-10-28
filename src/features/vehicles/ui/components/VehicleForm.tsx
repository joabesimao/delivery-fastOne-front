import type { ReactNode } from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import { Form, Formik } from "formik";
import {
  deliverymanFullName,
  type DeliverymanSummary,
} from "@/features/deliverymen";
import FieldLabel from "@/shared/ui/form/FieldLabel";
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
    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Placa *" />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ex: ABC1D23"
                  name="plate"
                  value={values.plate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.plate && errors.plate)}
                  helperText={touched.plate && errors.plate}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Modelo *" />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ex: CG 160"
                  name="model"
                  value={values.model}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.model && errors.model)}
                  helperText={touched.model && errors.model}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Marca" />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ex: Honda"
                  name="brand"
                  value={values.brand}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Entregador" />
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="deliverymanId"
                  slotProps={{ select: { displayEmpty: true } }}
                  value={values.deliverymanId}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                </TextField>
              </Grid>
            </Grid>
          ),
        })}
      </Form>
    )}
  </Formik>
);

export default VehicleForm;
