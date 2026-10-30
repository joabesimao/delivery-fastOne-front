import type { ReactNode } from "react";
import { Grid } from "@mui/material";
import { Form, Formik } from "formik";
import FormTextField from "@/shared/ui/form/FormTextField";
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
    {({ isSubmitting }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  name="name"
                  label="Nome da cidade *"
                  placeholder="Ex: São Paulo"
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
