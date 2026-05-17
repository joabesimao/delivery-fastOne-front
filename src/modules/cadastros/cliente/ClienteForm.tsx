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

interface ClienteFormValues {
  name: string;
  lastName: string;
  phone: string;
}

const initialValues: ClienteFormValues = {
  name: "",
  lastName: "",
  phone: "",
};

type FormErrors = {
  name?: string;
  lastName?: string;
  phone?: string;
};

const validate = (values: ClienteFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!values.lastName.trim()) errors.lastName = "Informe o sobrenome.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  return errors;
};

const ClienteForm: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (
    values: ClienteFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/client", {
        name: values.name,
        lastName: values.lastName,
        phone: values.phone,
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
          p: { xs: 3, md: 5 },
          maxWidth: 720,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid", borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, textAlign: "center", color: "text.primary" }}>
          Cadastrar cliente
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
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
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
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

export default ClienteForm;
