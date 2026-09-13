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
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { currencyInputMask, parseCurrencyToNumber } from "../../../helpers/masks";

interface ProdutoFormValues {
  name: string;
  price: string;
  description: string;
  category: string;
}

const initialValues: ProdutoFormValues = {
  name: "",
  price: "",
  description: "",
  category: "",
};

type FormErrors = {
  name?: string;
  price?: string;
  description?: string;
  category?: string;
};

const validate = (values: ProdutoFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome do produto.";
  if (!values.description.trim()) errors.description = "Informe a descrição.";
  if (!values.category.trim()) errors.category = "Informe a categoria.";

  const price = parseCurrencyToNumber(values.price);
  if (!values.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = "Informe um preço válido.";
  }

  return errors;
};

const ProdutoForm: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (
    values: ProdutoFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/product", {
        name: values.name.trim(),
        price: parseCurrencyToNumber(values.price),
        description: values.description.trim(),
        category: values.category.trim(),
      });
      setSnackbar({ open: true, message: "Produto cadastrado com sucesso!", severity: "success" });
      resetForm();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erro ao cadastrar produto. Tente novamente.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
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
          Cadastrar produto
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Dados do produto
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FieldLabel label="Nome *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Refrigerante 2L"
                    name="name" value={values.name}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Preço *" />
                  <TextField
                    fullWidth size="small" placeholder="0,00"
                    type="text"
                    slotProps={{
                      htmlInput: { inputMode: "numeric" },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" color="text.secondary">R$</Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    name="price" value={values.price}
                    onChange={(e) => setFieldValue("price", currencyInputMask(e.target.value))}
                    onBlur={handleBlur}
                    error={Boolean(touched.price && errors.price)}
                    helperText={touched.price && errors.price}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Categoria *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Bebidas"
                    name="category" value={values.category}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.category && errors.category)}
                    helperText={touched.category && errors.category}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Descrição *" />
                  <TextField
                    fullWidth size="small" placeholder="Breve descrição do produto"
                    name="description" value={values.description}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mt: 2.5, mb: 2.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "stretch", sm: "space-between" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.25,
                }}
              >
                <Button
                  variant="text" color="inherit"
                  onClick={() => navigate("/dashboard/produtos")}
                  sx={{ textTransform: "none", color: "text.secondary", width: { xs: "100%", sm: "auto" } }}
                >
                  Ver produtos cadastrados
                </Button>
                <Box sx={{ display: "flex", gap: 1.25, flexDirection: { xs: "column", sm: "row" } }}>
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

export default ProdutoForm;
