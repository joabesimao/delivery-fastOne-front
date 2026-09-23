import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Formik, Form } from "formik";
import api from "../../../services/api";
import { isValidPhone, phoneMask, stripPhone, isValidCPF, cpfMask, stripCPF } from "../../../helpers/masks";
import { extractApiErrorMessage } from "../../../helpers/extractApiErrorMessage";

interface EntregadorFormValues {
  name: string;
  lastName: string;
  phone: string;
  cpf: string;
  numberQualification: string;
}

const initialValues: EntregadorFormValues = {
  name: "",
  lastName: "",
  phone: "",
  cpf: "",
  numberQualification: "",
};

type FormErrors = {
  name?: string;
  lastName?: string;
  phone?: string;
  cpf?: string;
  numberQualification?: string;
};

const makeValidate = (existingCpfs: Set<string>, existingQualifications: Set<string>) => (values: EntregadorFormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!values.lastName.trim()) errors.lastName = "Informe o sobrenome.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  else if (!isValidPhone(values.phone)) errors.phone = "Telefone inválido. Use DDD + número.";
  if (!values.cpf.trim()) errors.cpf = "Informe o CPF.";
  else if (!isValidCPF(values.cpf)) errors.cpf = "CPF inválido. Use o formato XXX.XXX.XXX-XX ou apenas números.";
  else if (existingCpfs.has(stripCPF(values.cpf))) errors.cpf = "Este CPF já está cadastrado no sistema.";
  if (!values.numberQualification.trim()) errors.numberQualification = "Informe o número da habilitação.";
  else if (existingQualifications.has(values.numberQualification))
    errors.numberQualification = "Esta habilitação já está cadastrada no sistema.";
  return errors;
};

const EntregadorForm: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [existingCpfs, setExistingCpfs] = useState<Set<string>>(new Set());
  const [existingQualifications, setExistingQualifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<{ cpf?: string; numberQualification?: string }[]>("/deliveryman")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setExistingCpfs(
          new Set(list.map((d) => stripCPF(d.cpf ?? "")).filter((cpf) => cpf.length === 11)),
        );
        setExistingQualifications(
          new Set(list.map((d) => d.numberQualification).filter((q): q is string => Boolean(q))),
        );
      })
      .catch(() => {
        setExistingCpfs(new Set());
        setExistingQualifications(new Set());
      });
  }, []);

  const handleSubmit = async (
    values: EntregadorFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.post("/deliveryman", {
        name: values.name,
        lastName: values.lastName,
        phone: stripPhone(values.phone),
        cpf: stripCPF(values.cpf),
        numberQualification: values.numberQualification,
      });
      setExistingCpfs((prev) => new Set(prev).add(stripCPF(values.cpf)));
      setExistingQualifications((prev) => new Set(prev).add(values.numberQualification));
      setSnackbar({ open: true, message: "Entregador cadastrado com sucesso!", severity: "success" });
      resetForm();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: extractApiErrorMessage(error, "Erro ao cadastrar entregador. Tente novamente."),
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
            Cadastrar entregador
          </Typography>
          <Box sx={{ width: 32 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Formik initialValues={initialValues} validate={makeValidate(existingCpfs, existingQualifications)} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, setFieldTouched }) => (
            <Form noValidate>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Dados do entregador
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Nome *" />
                  <TextField
                    fullWidth size="small" placeholder="Nome do entregador"
                    name="name" value={values.name}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Sobrenome *" />
                  <TextField
                    fullWidth size="small" placeholder="Sobrenome do entregador"
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

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="CPF *" />
                  <TextField
                    fullWidth size="small" placeholder="000.000.000-00"
                    name="cpf" value={values.cpf}
                    onChange={(e) => {
                      const masked = cpfMask(e.target.value);
                      setFieldValue("cpf", masked);
                      if (stripCPF(masked).length === 11) {
                        setFieldTouched("cpf", true, false);
                      }
                    }}
                    onBlur={handleBlur}
                    inputProps={{ maxLength: 14, inputMode: "numeric" }}
                    error={Boolean(touched.cpf && errors.cpf)}
                    helperText={touched.cpf && errors.cpf}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Número da Habilitação *" />
                  <TextField
                    fullWidth size="small" placeholder="Número da CNH"
                    name="numberQualification" value={values.numberQualification}
                    onChange={(e) => {
                      setFieldValue("numberQualification", e.target.value.replace(/\D/g, ""));
                      setFieldTouched("numberQualification", true, false);
                    }}
                    onBlur={handleBlur}
                    inputProps={{ maxLength: 12, inputMode: "numeric" }}
                    error={Boolean(touched.numberQualification && errors.numberQualification)}
                    helperText={touched.numberQualification && errors.numberQualification}
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

export default EntregadorForm;
