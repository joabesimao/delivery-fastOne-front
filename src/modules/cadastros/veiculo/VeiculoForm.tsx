import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
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

interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
}

interface VeiculoFormValues {
  plate: string;
  model: string;
  brand: string;
  deliverymanId: string;
}

const initialValues: VeiculoFormValues = {
  plate: "",
  model: "",
  brand: "",
  deliverymanId: "",
};

type FormErrors = {
  plate?: string;
  model?: string;
};

const validate = (values: VeiculoFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.plate.trim()) errors.plate = "Informe a placa do veículo.";
  if (!values.model.trim()) errors.model = "Informe o modelo do veículo.";
  return errors;
};

const VeiculoForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    api
      .get<DeliverymanOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
  }, []);

  const handleSubmit = async (
    values: VeiculoFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/vehicle", {
        plate: values.plate.trim().toUpperCase(),
        model: values.model.trim(),
        brand: values.brand.trim() || undefined,
        deliverymanId: values.deliverymanId ? Number(values.deliverymanId) : undefined,
      });
      setSnackbar({ open: true, message: "Veículo cadastrado com sucesso!", severity: "success" });
      resetForm();
      onSuccess?.();
    } catch (err) {
      setSnackbar({
        open: true,
        message: extractApiErrorMessage(err, "Erro ao cadastrar veículo. Tente novamente."),
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
            Cadastrar veículo
          </Typography>
          <Box sx={{ width: 32 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Dados do veículo
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Placa *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: ABC1D23"
                    name="plate" value={values.plate}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.plate && errors.plate)}
                    helperText={touched.plate && errors.plate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Modelo *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: CG 160"
                    name="model" value={values.model}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.model && errors.model)}
                    helperText={touched.model && errors.model}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Marca" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Honda"
                    name="brand" value={values.brand}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Entregador" />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="deliverymanId"
                    value={values.deliverymanId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="" disabled>
                      <em>Selecione o entregador (opcional)</em>
                    </MenuItem>
                    {deliverymen.map((d) => (
                      <MenuItem key={d.id} value={String(d.id)}>
                        {d.name} {d.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
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
                  {isSubmitting ? "Salvando..." : "Cadastrar"}
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

export default VeiculoForm;
