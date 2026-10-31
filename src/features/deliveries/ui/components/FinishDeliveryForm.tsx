import { Box, Button, CircularProgress, Divider, Grid } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Form, Formik } from "formik";
import FormCurrencyField from "@/shared/ui/form/FormCurrencyField";
import FormSelectField, {
  type SelectOption,
} from "@/shared/ui/form/FormSelectField";
import FormTextField from "@/shared/ui/form/FormTextField";
import type { Delivery } from "../../domain/delivery";
import {
  toFinishDeliveryFormValues,
  toFinishDeliveryInput,
  validateFinishDeliveryForm,
  type FinishDeliveryInput,
} from "../../domain/finishDelivery";

interface FinishDeliveryFormProps {
  delivery: Delivery;
  deliverymanOptions: SelectOption[];
  onSubmit: (input: FinishDeliveryInput) => Promise<boolean>;
  onCancel: () => void;
}

const FinishDeliveryForm = ({
  delivery,
  deliverymanOptions,
  onSubmit,
  onCancel,
}: FinishDeliveryFormProps) => (
  <Formik
    initialValues={toFinishDeliveryFormValues(delivery)}
    validate={validateFinishDeliveryForm}
    onSubmit={async (values) => {
      await onSubmit(toFinishDeliveryInput(values));
    }}
  >
    {({ isSubmitting }) => (
      <Form noValidate>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <FormSelectField
              name="deliverymanId"
              label="Entregador responsável *"
              placeholder="Selecione o entregador"
              options={deliverymanOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="quantity"
              label="Quantidade *"
              placeholder="Ex: 3"
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormCurrencyField name="amount" label="Valor final *" />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              borderColor: "divider",
              color: "text.secondary",
            }}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              bgcolor: "#4361EE",
              "&:hover": { bgcolor: "#3451D1" },
            }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleOutlineIcon fontSize="small" />
              )
            }
          >
            {isSubmitting ? "Finalizando..." : "Finalizar entrega"}
          </Button>
        </Box>
      </Form>
    )}
  </Formik>
);

export default FinishDeliveryForm;
