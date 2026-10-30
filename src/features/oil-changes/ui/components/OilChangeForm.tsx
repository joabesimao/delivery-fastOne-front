import type { ReactNode } from "react";
import { Grid } from "@mui/material";
import { Form, Formik } from "formik";
import FormSelectField, {
  type SelectOption,
} from "@/shared/ui/form/FormSelectField";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  previewNextChangeKm,
  toOilChangeInput,
  validateOilChangeForm,
  type OilChangeFormValues,
  type OilChangeInput,
} from "../../domain/oilChange";

interface OilChangeFormProps {
  initialValues: OilChangeFormValues;
  vehicleOptions: SelectOption[];
  deliverymanOptions: SelectOption[];
  nextChangeInterval?: number;
  onSubmit: (input: OilChangeInput) => Promise<boolean>;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const OilChangeForm = ({
  initialValues,
  vehicleOptions,
  deliverymanOptions,
  nextChangeInterval,
  onSubmit,
  resetOnSuccess = false,
  children,
}: OilChangeFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={validateOilChangeForm}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(toOilChangeInput(values));
      if (succeeded && resetOnSuccess) resetForm();
    }}
  >
    {({ values, isSubmitting }) => {
      const nextChangeKm =
        nextChangeInterval === undefined
          ? null
          : previewNextChangeKm(values.km, nextChangeInterval);

      return (
        <Form noValidate>
          {children({
            submitting: isSubmitting,
            fields: (
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelectField
                    name="vehicleId"
                    label="Veículo *"
                    placeholder="Selecione o veículo"
                    options={vehicleOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelectField
                    name="deliverymanId"
                    label="Entregador *"
                    placeholder="Selecione o entregador"
                    options={deliverymanOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    name="km"
                    label="Km lançado *"
                    placeholder="Ex: 12500"
                    type="number"
                    slotProps={{ htmlInput: { min: 0 } }}
                    helperText={
                      nextChangeKm === null
                        ? undefined
                        : `Próxima troca: ${nextChangeKm.toLocaleString("pt-BR")} km`
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    name="changeDate"
                    label="Data da troca *"
                    type="date"
                  />
                </Grid>
              </Grid>
            ),
          })}
        </Form>
      );
    }}
  </Formik>
);

export default OilChangeForm;
