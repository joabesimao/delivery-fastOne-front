import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import api from "../../../services/api";

interface CidadeFormValues {
  name: string;
}

const initialValues: CidadeFormValues = {
  name: "",
};

type FormErrors = {
  name?: string;
};

const validate = (values: CidadeFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome da cidade.";
  return errors;
};

const CidadesForm: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (
    values: CidadeFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/city", { name: values.name });
      setSnackbar({ open: true, message: "Cidade cadastrada com sucesso!", severity: "success" });
      resetForm();
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar cidade. Tente novamente.",
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
          maxWidth: 720,
          mx: "auto",
          bgcolor: "#fff",
          border: "1px solid #E2E4E9",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, textAlign: "center", color: "#1A1D23" }}>
          Cadastrar cidade
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1A1D23", mb: 2 }}>
                Dados da cidade
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <FieldLabel label="Nome da cidade *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: São Paulo"
                    name="name" value={values.name}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
              </Grid>

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
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "#374151" }}>
    {label}
  </Typography>
);

export default CidadesForm;
