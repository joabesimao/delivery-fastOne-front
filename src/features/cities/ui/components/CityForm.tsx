import type { ReactNode } from "react";
import { Grid, TextField } from "@mui/material";
import { Form, Formik } from "formik";
import FieldLabel from "@/shared/ui/form/FieldLabel";
import {
  toCityInput,
  validateCityForm,
  type CityFormValues,
  type CityInput,
} from "../../domain/city";

interface CityFormProps {
  initialValues: CityFormValues;
  onSubmit: (input: CityInput) => Promise<boolean>;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const CityForm = ({
  initialValues,
  onSubmit,
  resetOnSuccess = false,
  children,
}: CityFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={validateCityForm}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(toCityInput(values));
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
                <FieldLabel label="Nome da cidade *" />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ex: São Paulo"
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

export default CityForm;
