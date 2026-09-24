import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { extractApiErrorMessage } from "../../../helpers/extractApiErrorMessage";
import { computeTotalValue } from "./computeTotalValue";

interface VehicleOption {
  id: number;
  plate: string;
  model: string;
}

interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
}

interface AbastecimentoFormValues {
  vehicleId: string;
  deliverymanId: string;
  km: string;
  liters: string;
  pricePerLiter: string;
  totalValue: string;
  refillDate: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const initialValues: AbastecimentoFormValues = {
  vehicleId: "",
  deliverymanId: "",
  km: "",
  liters: "",
  pricePerLiter: "",
  totalValue: "",
  refillDate: todayIso(),
};

type FormErrors = {
  vehicleId?: string;
  deliverymanId?: string;
  km?: string;
  liters?: string;
  pricePerLiter?: string;
  totalValue?: string;
  refillDate?: string;
};

const validate = (values: AbastecimentoFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.vehicleId) errors.vehicleId = "Selecione o veículo.";
  if (!values.deliverymanId) errors.deliverymanId = "Selecione o entregador.";
  if (!values.km || Number(values.km) <= 0) errors.km = "Informe o km do abastecimento.";
  if (!values.liters || Number(values.liters) <= 0) errors.liters = "Informe os litros abastecidos.";
  if (!values.pricePerLiter || Number(values.pricePerLiter) <= 0) errors.pricePerLiter = "Informe o preço do litro.";
  if (!values.totalValue || Number(values.totalValue) <= 0) errors.totalValue = "Informe o valor pago.";
  if (!values.refillDate) errors.refillDate = "Informe a data do abastecimento.";
  return errors;
};

const AbastecimentoForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    api
      .get<VehicleOption[]>("/vehicle")
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicles([]));
    api
      .get<DeliverymanOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
  }, []);

  const handleSubmit = async (
    values: AbastecimentoFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/fuel-refill", {
        vehicleId: Number(values.vehicleId),
        deliverymanId: Number(values.deliverymanId),
        km: Number(values.km),
        liters: Number(values.liters),
        pricePerLiter: Number(values.pricePerLiter),
        totalValue: Number(values.totalValue),
        refillDate: new Date(values.refillDate).toISOString(),
      });
      setSnackbar({ open: true, message: "Abastecimento lançado com sucesso!", severity: "success" });
      resetForm();
      onSuccess?.();
    } catch (err) {
      setSnackbar({
        open: true,
        message: extractApiErrorMessage(err, "Erro ao lançar o abastecimento. Tente novamente."),
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
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          backdropFilter: "blur(2px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <IconButton size="small" onClick={() => navigate("/dashboard")}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
            Lançar abastecimento
          </Typography>
          <Box sx={{ width: 32 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit} enableReinitialize>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Dados do abastecimento
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Veículo *" />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="vehicleId"
                    value={values.vehicleId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.vehicleId && errors.vehicleId)}
                    helperText={touched.vehicleId && errors.vehicleId}
                  >
                    <MenuItem value="" disabled>
                      <em>Selecione o veículo</em>
                    </MenuItem>
                    {vehicles.map((v) => (
                      <MenuItem key={v.id} value={String(v.id)}>
                        {v.plate} — {v.model}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Entregador *" />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="deliverymanId"
                    value={values.deliverymanId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.deliverymanId && errors.deliverymanId)}
                    helperText={touched.deliverymanId && errors.deliverymanId}
                  >
                    <MenuItem value="" disabled>
                      <em>Selecione o entregador</em>
                    </MenuItem>
                    {deliverymen.map((d) => (
                      <MenuItem key={d.id} value={String(d.id)}>
                        {d.name} {d.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Km no abastecimento *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: 12500"
                    type="number"
                    slotProps={{ htmlInput: { min: 0 } }}
                    name="km" value={values.km}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.km && errors.km)}
                    helperText={touched.km && errors.km}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Data do abastecimento *" />
                  <TextField
                    fullWidth size="small"
                    type="date"
                    name="refillDate" value={values.refillDate}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.refillDate && errors.refillDate)}
                    helperText={touched.refillDate && errors.refillDate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Litros abastecidos *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: 8.5"
                    type="number"
                    slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    name="liters" value={values.liters}
                    onChange={(e) => {
                      handleChange(e);
                      void setFieldValue("totalValue", computeTotalValue(e.target.value, values.pricePerLiter));
                    }}
                    onBlur={handleBlur}
                    error={Boolean(touched.liters && errors.liters)}
                    helperText={touched.liters && errors.liters}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Preço do litro *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: 6.299"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 0, step: "0.001" },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" color="text.secondary">R$</Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    name="pricePerLiter" value={values.pricePerLiter}
                    onChange={(e) => {
                      handleChange(e);
                      void setFieldValue("totalValue", computeTotalValue(values.liters, e.target.value));
                    }}
                    onBlur={handleBlur}
                    error={Boolean(touched.pricePerLiter && errors.pricePerLiter)}
                    helperText={touched.pricePerLiter && errors.pricePerLiter}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Valor pago *" />
                  <TextField
                    fullWidth size="small" placeholder="0,00"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 0, step: "0.01" },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" color="text.secondary">R$</Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    name="totalValue" value={values.totalValue}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.totalValue && errors.totalValue)}
                    helperText={(touched.totalValue && errors.totalValue) || "Calculado por litros × preço; pode ajustar."}
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
                <Button
                  type="submit" variant="contained" disabled={isSubmitting}
                  sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" }, width: { xs: "100%", sm: "auto" } }}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {isSubmitting ? "Salvando..." : "Lançar abastecimento"}
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

const FieldLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "text.secondary" }}>
    {label}
  </Typography>
);

export default AbastecimentoForm;
