import type { ReactNode } from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import { Form, Formik } from "formik";
import type { City } from "@/features/cities";
import FieldLabel from "@/shared/ui/form/FieldLabel";
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
    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FieldLabel label="Cidade *" />
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="cityId"
                  value={values.cityId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.cityId && errors.cityId)}
                  helperText={touched.cityId && errors.cityId}
                >
                  <MenuItem value="" disabled>
                    <em>Selecione a cidade</em>
                  </MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FieldLabel label="Nome do bairro *" />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ex: Centro"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
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
