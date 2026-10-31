import type { ReactNode } from "react";
import { Grid, InputAdornment, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import FormSelectField, {
  type SelectOption,
} from "@/shared/ui/form/FormSelectField";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  computeTotalValue,
  toFuelRefillInput,
  validateFuelRefillForm,
  type FuelRefillFormValues,
  type FuelRefillInput,
} from "../../domain/fuelRefill";

interface FuelRefillFormProps {
  initialValues: FuelRefillFormValues;
  vehicleOptions: SelectOption[];
  deliverymanOptions: SelectOption[];
  onSubmit: (input: FuelRefillInput) => Promise<boolean>;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const currencyAdornment = {
  startAdornment: (
    <InputAdornment position="start">
      <Typography variant="body2" color="text.secondary">
        R$
      </Typography>
    </InputAdornment>
  ),
};

const FuelRefillForm = ({
  initialValues,
  vehicleOptions,
  deliverymanOptions,
  onSubmit,
  resetOnSuccess = false,
  children,
}: FuelRefillFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={validateFuelRefillForm}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(toFuelRefillInput(values));
      if (succeeded && resetOnSuccess) resetForm();
    }}
  >
    {({ values, isSubmitting, setFieldValue }) => (
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
                  label="Km no abastecimento *"
                  placeholder="Ex: 12500"
                  type="number"
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="refillDate"
                  label="Data do abastecimento *"
                  type="date"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormTextField
                  name="liters"
                  label="Litros abastecidos *"
                  placeholder="Ex: 8.5"
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                  onChange={(e) =>
                    void setFieldValue(
                      "totalValue",
                      computeTotalValue(e.target.value, values.pricePerLiter),
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormTextField
                  name="pricePerLiter"
                  label="Preço do litro *"
                  placeholder="Ex: 6.299"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0, step: "0.001" },
                    input: currencyAdornment,
                  }}
                  onChange={(e) =>
                    void setFieldValue(
                      "totalValue",
                      computeTotalValue(values.liters, e.target.value),
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormTextField
                  name="totalValue"
                  label="Valor pago *"
                  placeholder="0,00"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0, step: "0.01" },
                    input: currencyAdornment,
                  }}
                  helperText="Calculado por litros × preço; pode ajustar."
                />
              </Grid>
            </Grid>
          ),
        })}
      </Form>
    )}
  </Formik>
);

export default FuelRefillForm;
