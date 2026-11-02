import type { ReactNode } from "react";
import { Box, Button, CircularProgress, Divider, Grid } from "@mui/material";
import { Form, Formik } from "formik";
import type { ClientRegister } from "@/features/clients";
import FormCurrencyField from "@/shared/ui/form/FormCurrencyField";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import FormSelectField, {
  type SelectOption,
} from "@/shared/ui/form/FormSelectField";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  toDeliveryOrderClient,
  toDeliveryOrderFormValues,
  validateDeliveryOrderForm,
  type DeliveryOrderClient,
  type DeliveryOrderFormValues,
} from "../../domain/deliveryOrder";
import ClientSearchField from "./ClientSearchField";
import SelectedClientCard from "./SelectedClientCard";

import { COLORS } from "@/shared/theme/colors";
interface DeliveryOrderFormProps {
  initialClient: DeliveryOrderClient | null;
  registers: ClientRegister[];
  registersLoading: boolean;
  deliverymanOptions: SelectOption[];
  sheetOptions: ReactNode;
  onSubmit: (
    values: DeliveryOrderFormValues,
    client: DeliveryOrderClient,
  ) => Promise<boolean>;
}

const DeliveryOrderForm = ({
  initialClient,
  registers,
  registersLoading,
  deliverymanOptions,
  sheetOptions,
  onSubmit,
}: DeliveryOrderFormProps) => (
  <Formik
    initialValues={toDeliveryOrderFormValues(initialClient)}
    validate={validateDeliveryOrderForm}
    onSubmit={async (values, { resetForm }) => {
      if (!values.client) return;
      if (await onSubmit(values, values.client)) resetForm();
    }}
  >
    {({ values, errors, touched, isSubmitting, setFieldValue }) => (
      <Form noValidate>
        {!initialClient && (
          <>
            <FormSectionTitle title="Buscar cliente existente" />
            <Box sx={{ mb: 1 }}>
              <ClientSearchField
                registers={registers}
                loading={registersLoading}
                selectedId={values.client?.registerId ?? null}
                error={touched.client ? errors.client : undefined}
                onSelect={(register) =>
                  void setFieldValue(
                    "client",
                    register ? toDeliveryOrderClient(register) : null,
                  )
                }
              />
            </Box>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {values.client?.registerId ? (
          <>
            <FormSectionTitle title="Cliente selecionado" />
            <SelectedClientCard client={values.client} />
            <Divider sx={{ my: 3 }} />
          </>
        ) : null}

        <FormSectionTitle title="Detalhes do pedido" />
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelectField
              name="deliverymanId"
              label="Entregador"
              placeholder="Selecione o entregador (opcional)"
              options={deliverymanOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="quantity"
              label="Quantidade *"
              placeholder="Ex: 5"
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormCurrencyField name="amount" label="Valor *" />
          </Grid>
        </Grid>

        <Divider sx={{ mt: 3, mb: 3 }} />
        {sheetOptions}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            type="reset"
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              borderColor: "divider",
              color: "text.secondary",
            }}
          >
            Limpar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              bgcolor: COLORS.brand,
              "&:hover": { bgcolor: COLORS.brandHover },
            }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isSubmitting ? "Enviando..." : "Criar e Despachar"}
          </Button>
        </Box>
      </Form>
    )}
  </Formik>
);

export default DeliveryOrderForm;
