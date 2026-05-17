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
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Formik, Form } from "formik";
import api from "../../services/api";

interface OrderData {
  id: number;
  quantity: string;
  amount: number;
  data: string;
  Register: {
    client: { name: string; lastName: string; phone: string };
    address: {
      street: string;
      neighborhood: string;
      numberHouse: number;
      reference: string;
      city: string;
    };
  };
}

interface FinalizeFormValues {
  quantity: string;
  amount: number | "";
}

const FinalizarEntrega: React.FC = () => {
  const [orderId, setOrderId] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSearch = async () => {
    if (!orderIdInput.trim()) {
      setSearchError("Informe o ID do pedido.");
      return;
    }
    setSearchError("");
    setSearching(true);
    setOrder(null);
    try {
      const res = await api.get(`/orderDelivery/${orderIdInput.trim()}`);
      setOrder(res.data);
      setOrderId(orderIdInput.trim());
    } catch {
      setSearchError("Pedido não encontrado. Verifique o ID informado.");
    } finally {
      setSearching(false);
    }
  };

  const handleFinalize = async (
    values: FinalizeFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await api.put(`/orderDelivery/${orderId}`, {
        quantity: values.quantity,
        amount: Number(values.amount),
      });
      setSnackbar({ open: true, message: "Entrega finalizada com sucesso!", severity: "success" });
      setOrder(null);
      setOrderIdInput("");
      setOrderId("");
      resetForm();
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao finalizar a entrega. Tente novamente.",
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
          maxWidth: 800,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid", borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {/* Título */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, textAlign: "center", color: "text.primary" }}>
          Finalizar entrega
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* ── Busca por ID ─────────────────────────────────── */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
          Buscar pedido
        </Typography>

        <Box sx={{ mb: 4 }}>
          <FieldLabel label="ID do pedido" />
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              size="small" placeholder="Digite o número do pedido"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              error={Boolean(searchError)}
              helperText={searchError}
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searching}
              sx={{
                height: 40, textTransform: "none", whiteSpace: "nowrap",
                bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" },
              }}
              startIcon={searching ? <CircularProgress size={14} color="inherit" /> : <SearchIcon />}
            >
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </Box>
        </Box>

        {/* ── Dados do Pedido ───────────────────────────────── */}
        {order && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
              Dados do pedido
            </Typography>

            <Box sx={{ mb: 4 }}>
              {/* Chip com ID + data */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Chip
                  label={`Pedido #${order.id}`}
                  size="small"
                  sx={{
                    bgcolor: "#E8ECFF", color: "#4361EE",
                    fontWeight: 700, border: "1px solid #C7D2FE",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(order.data).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Cliente */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight={600}
                      sx={{ color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}
                    >
                      Cliente
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: "text.primary" }}>
                      {order.Register.client.name} {order.Register.client.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.Register.client.phone}
                    </Typography>
                  </Box>
                </Grid>

                {/* Endereço */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight={600}
                      sx={{ color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}
                    >
                      Endereço
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, color: "text.primary" }}>
                      {order.Register.address.street}, {order.Register.address.numberHouse}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.Register.address.neighborhood} — {order.Register.address.city}
                    </Typography>
                    {order.Register.address.reference && (
                      <Typography variant="caption" color="text.secondary">
                        Ref: {order.Register.address.reference}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* ── Confirmar Entrega ────────────────────────────── */}
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
              Confirmar dados da entrega
            </Typography>

            <Formik
              initialValues={{ quantity: order.quantity, amount: order.amount }}
              validate={(values) => {
                const errors: Partial<FinalizeFormValues> = {};
                if (!values.quantity.trim() || Number(values.quantity) <= 0)
                  errors.quantity = "Informe a quantidade.";
                if (!values.amount || Number(values.amount) <= 0)
                  errors.amount = "Informe o valor." as unknown as number;
                return errors;
              }}
              onSubmit={handleFinalize}
              enableReinitialize
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form noValidate>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel label="Quantidade *" />
                      <TextField
                        fullWidth size="small" placeholder="Ex: 3"
                        type="number"
                        slotProps={{ htmlInput: { min: 1 } }}
                        name="quantity" value={values.quantity}
                        onChange={handleChange} onBlur={handleBlur}
                        error={Boolean(touched.quantity && errors.quantity)}
                        helperText={touched.quantity && errors.quantity}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel label="Valor final *" />
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

                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      variant="outlined" color="inherit" disabled={isSubmitting}
                      sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary" }}
                      onClick={() => {
                        setOrder(null);
                        setOrderIdInput("");
                        setOrderId("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit" variant="contained" disabled={isSubmitting}
                      sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" } }}
                      startIcon={
                        isSubmitting
                          ? <CircularProgress size={16} color="inherit" />
                          : <CheckCircleOutlineIcon fontSize="small" />
                      }
                    >
                      {isSubmitting ? "Finalizando..." : "Finalizar entrega"}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </>
        )}
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
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "text.secondary" }}>
    {label}
  </Typography>
);

export default FinalizarEntrega;
