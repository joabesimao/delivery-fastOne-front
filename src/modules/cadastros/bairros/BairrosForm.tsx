import React, { useState, useEffect } from "react";
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

interface CityOption {
  id: number;
  name: string;
}

interface BairroFormValues {
  name: string;
  cityId: string;
}

const initialValues: BairroFormValues = {
  name: "",
  cityId: "",
};

type FormErrors = {
  name?: string;
  cityId?: string;
};

const validate = (values: BairroFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome do bairro.";
  if (!values.cityId) errors.cityId = "Selecione a cidade.";
  return errors;
};

const BairrosForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [cities, setCities] = useState<CityOption[]>([]);

  useEffect(() => {
    api
      .get<CityOption[]>("/city")
      .then((res) => setCities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCities([]));
  }, []);

  const handleSubmit = async (
    values: BairroFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/neighborhood", { name: values.name, cityId: Number(values.cityId) });
      setSnackbar({ open: true, message: "Bairro cadastrado com sucesso!", severity: "success" });
      resetForm();
      onSuccess?.();
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar bairro. Tente novamente.",
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
          maxWidth: 720,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          backdropFilter: "blur(2px)",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, textAlign: "center", color: "text.primary" }}>
          Cadastrar bairro
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Dados do bairro
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <FieldLabel label="Cidade *" />
                  <TextField
                    select fullWidth size="small"
                    name="cityId" value={values.cityId}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.cityId && errors.cityId)}
                    helperText={touched.cityId && errors.cityId}
                  >
                    <MenuItem value="" disabled><em>Selecione a cidade</em></MenuItem>
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FieldLabel label="Nome do bairro *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Centro"
                    name="name" value={values.name}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
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

export default BairrosForm;
