import type { ReactNode } from "react";
import { Grid } from "@mui/material";
import { Form, Formik } from "formik";
import { cpfMask, phoneMask, stripCPF } from "@/shared/lib/masks";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  toDeliverymanInput,
  validateDeliverymanForm,
  type DeliverymanFormValues,
  type DeliverymanInput,
  type RegisteredDocuments,
} from "../../domain/deliveryman";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

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
    {({ isSubmitting }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    name="name"
                    label="Nome *"
                    placeholder="Nome do entregador"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    name="lastName"
                    label="Sobrenome *"
                    placeholder="Sobrenome do entregador"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    name="phone"
                    label="Telefone *"
                    placeholder="(00) 00000-0000"
                    mask={phoneMask}
                    slotProps={{
                      htmlInput: { maxLength: 15, inputMode: "numeric" },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    name="cpf"
                    label="CPF *"
                    placeholder="000.000.000-00"
                    mask={cpfMask}
                    touchOnChange={(cpf) => stripCPF(cpf).length === 11}
                    slotProps={{
                      htmlInput: { maxLength: 14, inputMode: "numeric" },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    name="numberQualification"
                    label="Número da Habilitação *"
                    placeholder="Número da CNH"
                    mask={onlyDigits}
                    touchOnChange={() => true}
                    slotProps={{
                      htmlInput: { maxLength: 12, inputMode: "numeric" },
                    }}
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
