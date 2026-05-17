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

interface BairroFormValues {
  name: string;
}

const initialValues: BairroFormValues = {
  name: "",
};

type FormErrors = {
  name?: string;
};

const validate = (values: BairroFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome do bairro.";
  return errors;
};

const BairrosForm: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (
    values: BairroFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/neighborhood", { name: values.name });
      setSnackbar({ open: true, message: "Bairro cadastrado com sucesso!", severity: "success" });
      resetForm();
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
          p: { xs: 3, md: 5 },
          maxWidth: 720,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid", borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, textAlign: "center", color: "text.primary" }}>
          Cadastrar bairro
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Dados do bairro
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
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

              <Divider sx={{ mt: 3, mb: 3 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button type="reset" variant="outlined" color="inherit" disabled={isSubmitting}
                  sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary" }}
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
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "text.secondary" }}>
    {label}
  </Typography>
);

export default BairrosForm;
