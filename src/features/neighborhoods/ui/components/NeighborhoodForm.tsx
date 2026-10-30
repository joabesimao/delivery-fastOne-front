import type { ReactNode } from "react";
import { Grid, MenuItem } from "@mui/material";
import { Form, Formik } from "formik";
import type { City } from "@/features/cities";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  toNeighborhoodInput,
  validateNeighborhoodForm,
  type NeighborhoodFormValues,
  type NeighborhoodInput,
} from "../../domain/neighborhood";

interface NeighborhoodFormProps {
  initialValues: NeighborhoodFormValues;
  cities: City[];
  onSubmit: (input: NeighborhoodInput) => Promise<boolean>;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const NeighborhoodForm = ({
  initialValues,
  cities,
  onSubmit,
  resetOnSuccess = false,
  children,
}: NeighborhoodFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={validateNeighborhoodForm}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(toNeighborhoodInput(values));
      if (succeeded && resetOnSuccess) resetForm();
    }}
  >
    {({ isSubmitting }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FormTextField select name="cityId" label="Cidade *">
                  <MenuItem value="" disabled>
                    <em>Selecione a cidade</em>
                  </MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </MenuItem>
                  ))}
                </FormTextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  name="name"
                  label="Nome do bairro *"
                  placeholder="Ex: Centro"
                />
              </Grid>
            </Grid>
          ),
        })}
      </Form>
    )}
  </Formik>
);

export default NeighborhoodForm;
