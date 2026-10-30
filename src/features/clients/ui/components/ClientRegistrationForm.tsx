import type { ReactNode } from "react";
import { Divider, Grid, MenuItem } from "@mui/material";
import { Form, Formik } from "formik";
import type { City } from "@/features/cities";
import type { Neighborhood } from "@/features/neighborhoods";
import { cpfMask, phoneMask, stripCPF } from "@/shared/lib/masks";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  neighborhoodsOfCity,
  toClientRegistrationInput,
  validateClientRegistrationForm,
  type ClientRegistrationFormValues,
  type ClientRegistrationInput,
} from "../../domain/clientRegistration";

interface ClientRegistrationFormProps {
  initialValues: ClientRegistrationFormValues;
  cities: City[];
  neighborhoods: Neighborhood[];
  onSubmit: (
    input: ClientRegistrationInput,
    values: ClientRegistrationFormValues,
  ) => Promise<boolean>;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const neighborhoodHint = (cityName: string, available: number) => {
  if (!cityName) return "Selecione a cidade primeiro.";
  if (available === 0) return "Nenhum bairro cadastrado para esta cidade.";
  return undefined;
};

const ClientRegistrationForm = ({
  initialValues,
  cities,
  neighborhoods,
  onSubmit,
  children,
}: ClientRegistrationFormProps) => (
  <Formik
    initialValues={initialValues}
    validate={validateClientRegistrationForm}
    onSubmit={async (values, { resetForm }) => {
      const succeeded = await onSubmit(
        toClientRegistrationInput(values),
        values,
      );
      if (succeeded) resetForm();
    }}
  >
    {({ values, isSubmitting, setFieldValue }) => {
      const cityNeighborhoods = neighborhoodsOfCity(
        cities,
        neighborhoods,
        values.address.city,
      );

      return (
        <Form noValidate>
          {children({
            submitting: isSubmitting,
            fields: (
              <>
                <FormSectionTitle title="Dados do cliente" />
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="name"
                      label="Nome completo *"
                      placeholder="Nome completo do cliente"
                    />
                  </Grid>
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
                </Grid>

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12 }}>
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

                <Divider sx={{ my: 3 }} />

                <FormSectionTitle title="Endereço" />
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="address.street"
                      label="Rua *"
                      placeholder="Nome da rua"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      select
                      name="address.city"
                      label="Cidade *"
                      onChange={() =>
                        void setFieldValue("address.neighborhood", "")
                      }
                    >
                      <MenuItem value="" disabled>
                        <em>Selecione a cidade</em>
                      </MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.name}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      select
                      name="address.neighborhood"
                      label="Bairro *"
                      disabled={
                        !values.address.city || cityNeighborhoods.length === 0
                      }
                      helperText={neighborhoodHint(
                        values.address.city,
                        cityNeighborhoods.length,
                      )}
                    >
                      <MenuItem value="" disabled>
                        <em>Selecione o bairro</em>
                      </MenuItem>
                      {cityNeighborhoods.map((neighborhood) => (
                        <MenuItem
                          key={neighborhood.id}
                          value={neighborhood.name}
                        >
                          {neighborhood.name}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormTextField
                      name="address.numberHouse"
                      label="Número *"
                      placeholder="Nº"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 9 }}>
                    <FormTextField
                      name="address.reference"
                      label="Referência"
                      placeholder="Ponto de referência"
                    />
                  </Grid>
                </Grid>
              </>
            ),
          })}
        </Form>
      );
    }}
  </Formik>
);

export default ClientRegistrationForm;
