import type { ReactNode } from "react";
import { Grid, TextField } from "@mui/material";
import { Form, Formik } from "formik";
import { cpfMask, phoneMask, stripCPF } from "@/shared/lib/masks";
import FieldLabel from "@/shared/ui/form/FieldLabel";
import {
  toDeliverymanInput,
  validateDeliverymanForm,
  type DeliverymanFormValues,
  type DeliverymanInput,
  type RegisteredDocuments,
} from "../../domain/deliveryman";

interface DeliverymanFormProps {
  initialValues: DeliverymanFormValues;
  registeredDocuments: RegisteredDocuments;
  onSubmit: (input: DeliverymanInput) => Promise<boolean>;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const DeliverymanForm = ({
  initialValues,
  registeredDocuments,
  onSubmit,
  resetOnSuccess = false,
  children,
}: DeliverymanFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={(values) => validateDeliverymanForm(values, registeredDocuments)}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(toDeliverymanInput(values));
      if (succeeded && resetOnSuccess) resetForm();
    }}
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      isSubmitting,
      setFieldValue,
      setFieldTouched,
    }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Nome *" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nome do entregador"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Sobrenome *" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Sobrenome do entregador"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.lastName && errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Telefone *" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="(00) 00000-0000"
                    name="phone"
                    value={values.phone}
                    onChange={(e) =>
                      setFieldValue("phone", phoneMask(e.target.value))
                    }
                    onBlur={handleBlur}
                    slotProps={{
                      htmlInput: { maxLength: 15, inputMode: "numeric" },
                    }}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="CPF *" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="000.000.000-00"
                    name="cpf"
                    value={values.cpf}
                    onChange={(e) => {
                      const masked = cpfMask(e.target.value);
                      void setFieldValue("cpf", masked);
                      if (stripCPF(masked).length === 11) {
                        void setFieldTouched("cpf", true, false);
                      }
                    }}
                    onBlur={handleBlur}
                    slotProps={{
                      htmlInput: { maxLength: 14, inputMode: "numeric" },
                    }}
                    error={Boolean(touched.cpf && errors.cpf)}
                    helperText={touched.cpf && errors.cpf}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Número da Habilitação *" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Número da CNH"
                    name="numberQualification"
                    value={values.numberQualification}
                    onChange={(e) => {
                      void setFieldValue(
                        "numberQualification",
                        e.target.value.replace(/\D/g, ""),
                      );
                      void setFieldTouched("numberQualification", true, false);
                    }}
                    onBlur={handleBlur}
                    slotProps={{
                      htmlInput: { maxLength: 12, inputMode: "numeric" },
                    }}
                    error={Boolean(
                      touched.numberQualification && errors.numberQualification,
                    )}
                    helperText={
                      touched.numberQualification && errors.numberQualification
                    }
                  />
                </Grid>
              </Grid>
            </>
          ),
        })}
      </Form>
    )}
  </Formik>
);

export default DeliverymanForm;
