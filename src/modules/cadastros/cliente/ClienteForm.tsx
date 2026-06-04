import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import api from "../../../services/api";
import { isValidPhone, phoneMask, stripPhone } from "../../../helpers/masks";

interface AddressValues {
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
}

interface ClienteFormValues {
  name: string;
  lastName: string;
  phone: string;
  address: AddressValues;
}

interface CityOption {
  id: number;
  name: string;
}

interface NeighborhoodOption {
  id: number;
  name: string;
  cityId: number;
}

const initialValues: ClienteFormValues = {
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
};

type FormErrors = {
  name?: string;
  lastName?: string;
  phone?: string;
  address?: Partial<AddressValues>;
};

const validate = (values: ClienteFormValues): FormErrors => {
  const errors: FormErrors = {};
  const addrErrors: Partial<AddressValues> = {};

  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!values.lastName.trim()) errors.lastName = "Informe o sobrenome.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  else if (!isValidPhone(values.phone)) errors.phone = "Telefone inválido. Use DDD + número.";
  if (!values.address.street.trim()) addrErrors.street = "Informe a rua.";
  if (!values.address.neighborhood.trim()) addrErrors.neighborhood = "Informe o bairro.";
  if (!values.address.numberHouse.trim()) addrErrors.numberHouse = "Informe o número.";
  if (!values.address.city.trim()) addrErrors.city = "Informe a cidade.";
  if (Object.keys(addrErrors).length) errors.address = addrErrors;

  return errors;
};

const ClienteForm: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [cities, setCities] = useState<CityOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodOption[]>([]);

  useEffect(() => {
    api.get<CityOption[]>("/city").then((res) => setCities(res.data)).catch(() => {});
    api.get<NeighborhoodOption[]>("/neighborhood").then((res) => setNeighborhoods(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (
    values: ClienteFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/register", {
        client: {
          name: values.name,
          lastName: values.lastName,
          phone: stripPhone(values.phone),
        },
        address: {
          street: values.address.street,
          neighborhood: values.address.neighborhood,
          numberHouse: Number(values.address.numberHouse),
          reference: values.address.reference,
          city: values.address.city,
        },
      });
      setSnackbar({ open: true, message: "Cliente cadastrado com sucesso!", severity: "success" });
      resetForm();
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar cliente. Tente novamente.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          backdropFilter: "blur(2px)",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, textAlign: "center", color: "text.primary" }}>
          Cadastrar cliente
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => {
            const selectedCity = cities.find((c) => c.name === values.address.city);
            const filteredNeighborhoods = useMemo(
              () => selectedCity ? neighborhoods.filter((n) => n.cityId === selectedCity.id) : [],
              [selectedCity, neighborhoods]
            );
            return (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
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
                    onChange={(e) => setFieldValue("phone", phoneMask(e.target.value))}
                    onBlur={handleBlur}
                    inputProps={{ maxLength: 15, inputMode: "numeric" }}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ── Endereço ──────────────────────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Endereço
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
                  <FieldLabel label="Cidade *" />
                  <TextField
                    select fullWidth size="small"
                    name="address.city" value={values.address.city}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("address.neighborhood", "");
                    }}
                    onBlur={handleBlur}
                    error={Boolean(touched.address?.city && errors.address?.city)}
                    helperText={touched.address?.city && errors.address?.city}
                  >
                    <MenuItem value="" disabled><em>Selecione a cidade</em></MenuItem>
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Bairro *" />
                  <TextField
                    select fullWidth size="small"
                    name="address.neighborhood" value={values.address.neighborhood}
                    onChange={handleChange} onBlur={handleBlur}
                    disabled={!values.address.city}
                    error={Boolean(touched.address?.neighborhood && errors.address?.neighborhood)}
                    helperText={touched.address?.neighborhood && errors.address?.neighborhood}
                  >
                    <MenuItem value="" disabled>
                      <em>{values.address.city ? "Selecione o bairro" : "Selecione a cidade primeiro"}</em>
                    </MenuItem>
                    {filteredNeighborhoods.map((b) => (
                      <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>
                    ))}
                  </TextField>
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
                <Grid size={{ xs: 12, sm: 9 }}>
                  <FieldLabel label="Referência" />
                  <TextField
                    fullWidth size="small" placeholder="Ponto de referência"
                    name="address.reference" value={values.address.reference}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mt: 2.5, mb: 2.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "stretch", sm: "flex-end" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.25,
                }}
              >
                <Button type="reset" variant="outlined" color="inherit" disabled={isSubmitting}
                  sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", width: { xs: "100%", sm: "auto" } }}
                >
                  Limpar
                </Button>
                <Button
                  type="submit" variant="contained" disabled={isSubmitting}
                  sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" }, width: { xs: "100%", sm: "auto" } }}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {isSubmitting ? "Salvando..." : "Cadastrar"}
                </Button>
              </Box>
            </Form>
            );
          }}
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

const FieldLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "text.secondary" }}>
    {label}
  </Typography>
);

export default ClienteForm;
