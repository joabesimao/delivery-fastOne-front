import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import api from "../../services/api";

interface AddressValues {
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
}

interface DeliveryFormValues {
  name: string;
  lastName: string;
  phone: string;
  address: AddressValues;
  quantity: string;
  amount: number | "";
}

const initialValues: DeliveryFormValues = {
  name: "",
  lastName: "",
  phone: "",
  address: {
    street: "",
    neighborhood: "",
    numberHouse: "",
    reference: "",
    city: "",
  },
  quantity: "",
  amount: "",
};

type FormErrors = {
  name?: string;
  lastName?: string;
  phone?: string;
  address?: Partial<AddressValues>;
  quantity?: string;
  amount?: string;
};

const validate = (values: DeliveryFormValues): FormErrors => {
  const errors: FormErrors = {};
  const addrErrors: Partial<AddressValues> = {};

  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!values.lastName.trim()) errors.lastName = "Informe o sobrenome.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  if (!values.address.street.trim()) addrErrors.street = "Informe a rua.";
  if (!values.address.neighborhood.trim()) addrErrors.neighborhood = "Informe o bairro.";
  if (!values.address.numberHouse.trim()) addrErrors.numberHouse = "Informe o número.";
  if (!values.address.city.trim()) addrErrors.city = "Informe a cidade.";
  if (Object.keys(addrErrors).length) errors.address = addrErrors;
  if (!values.quantity.trim() || Number(values.quantity) <= 0)
    errors.quantity = "Informe a quantidade.";
  if (values.amount === "" || Number(values.amount) <= 0)
    errors.amount = "Informe o valor.";

  return errors;
};

const EntregaForm: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (
    values: DeliveryFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const registerRes = await api.post("/register", {
        client: {
          name: values.name,
          lastName: values.lastName,
          phone: values.phone,
        },
        address: {
          street: values.address.street,
          neighborhood: values.address.neighborhood,
          numberHouse: Number(values.address.numberHouse),
          reference: values.address.reference,
          city: values.address.city,
        },
      });

      const registerId: number = registerRes.data.id;

      await api.post("/orderDelivery", {
        registerId,
        quantity: values.quantity,
        amount: Number(values.amount),
        data: new Date(),
      });

      setSnackbar({ open: true, message: "Pedido criado com sucesso!", severity: "success" });
      resetForm();
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao criar pedido. Tente novamente.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 960,
          mx: "auto",
          bgcolor: "#fff",
          border: "1px solid #E2E4E9",
          borderRadius: 2,
        }}
      >
        {/* Título */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, textAlign: "center", color: "#1A1D23" }}>
          Novo pedido de entrega
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>

              {/* ── Dados do Cliente ──────────────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A1D23", mb: 2 }}>
                Dados do cliente
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Nome *" />
                  <TextField
                    fullWidth size="small" placeholder="Nome do cliente"
                    name="name" value={values.name}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Sobrenome *" />
                  <TextField
                    fullWidth size="small" placeholder="Sobrenome do cliente"
                    name="lastName" value={values.lastName}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.lastName && errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Telefone *" />
                  <TextField
                    fullWidth size="small" placeholder="(00) 00000-0000"
                    name="phone" value={values.phone}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ── Endereço de Entrega ───────────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A1D23", mb: 2 }}>
                Endereço de entrega
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Rua *" />
                  <TextField
                    fullWidth size="small" placeholder="Nome da rua"
                    name="address.street" value={values.address.street}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.address?.street && errors.address?.street)}
                    helperText={touched.address?.street && errors.address?.street}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Bairro *" />
                  <TextField
                    fullWidth size="small" placeholder="Nome do bairro"
                    name="address.neighborhood" value={values.address.neighborhood}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.address?.neighborhood && errors.address?.neighborhood)}
                    helperText={touched.address?.neighborhood && errors.address?.neighborhood}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FieldLabel label="Número *" />
                  <TextField
                    fullWidth size="small" placeholder="Nº"
                    name="address.numberHouse" value={values.address.numberHouse}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.address?.numberHouse && errors.address?.numberHouse)}
                    helperText={touched.address?.numberHouse && errors.address?.numberHouse}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FieldLabel label="Referência" />
                  <TextField
                    fullWidth size="small" placeholder="Ponto de referência"
                    name="address.reference" value={values.address.reference}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Cidade *" />
                  <TextField
                    fullWidth size="small" placeholder="Nome da cidade"
                    name="address.city" value={values.address.city}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.address?.city && errors.address?.city)}
                    helperText={touched.address?.city && errors.address?.city}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ── Detalhes do Pedido ────────────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A1D23", mb: 2 }}>
                Detalhes do pedido
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Quantidade *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: 5"
                    type="number"
                    slotProps={{ htmlInput: { min: 1 } }}
                    name="quantity" value={values.quantity}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.quantity && errors.quantity)}
                    helperText={touched.quantity && errors.quantity}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Valor *" />
                  <TextField
                    fullWidth size="small" placeholder="0,00"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 0, step: 0.01 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" color="text.secondary">R$</Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    name="amount" value={values.amount}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.amount && errors.amount)}
                    helperText={touched.amount && errors.amount}
                  />
                </Grid>
              </Grid>

              {/* ── Ações ─────────────────────────────────────────── */}
              <Divider sx={{ mt: 3, mb: 3 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button type="reset" variant="outlined" color="inherit" disabled={isSubmitting}
                  sx={{ textTransform: "none", borderColor: "#C4C9D4", color: "#6B7280" }}
                >
                  Limpar
                </Button>
                <Button
                  type="submit" variant="contained" disabled={isSubmitting}
                  sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" } }}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {isSubmitting ? "Enviando..." : "Criar pedido"}
                </Button>
              </Box>

            </Form>
          )}
        </Formik>
      </Paper>

      <Snackbar
        open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

/** Label estático acima do campo */
const FieldLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "#374151" }}>
    {label}
  </Typography>
);

export default EntregaForm;
