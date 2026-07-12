import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Formik, Form } from "formik";
import api from "../../services/api";
import { exportHtmlToPdf } from "../../helpers/exportHtmlToPdf";
import { isValidPhone, phoneMask, stripPhone } from "../../helpers/masks";

interface RegisterResult {
  id: number;
  client: {
    name: string;
    lastName: string;
    phone: string;
  };
  address: {
    street: string;
    neighborhood: string;
    numberHouse: number;
    reference: string;
    city: string;
  };
}

interface AddressValues {
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
}

interface DeliveryFormValues {
  name: string;
  lastName: string;
  phone: string;
  deliverymanId: string;
  address: AddressValues;
  quantity: string;
  amount: number | "";
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

interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
  phone: string;
}

interface DeliverySheetData {
  orderId: number | null;
  createdAt: string;
  name: string;
  lastName: string;
  phone: string;
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
  quantity: string;
  amount: number;
}

type DeliverySheetFormat = "a4" | "thermal80" | "thermal58";

const DELIVERY_PRINT_PREF_KEY = "delivery_sheet_skip_preview";
const DELIVERY_COMPANY_NAME = import.meta.env.VITE_DELIVERY_COMPANY_NAME ?? "FastOne Delivery";
const DELIVERY_COMPANY_DOCUMENT = import.meta.env.VITE_DELIVERY_COMPANY_DOCUMENT ?? "";
const DELIVERY_DEFAULT_SHEET_FORMAT =
  (import.meta.env.VITE_DELIVERY_SHEET_FORMAT as DeliverySheetFormat | undefined) ?? "a4";
const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const initialValues: DeliveryFormValues = {
  name: "",
  lastName: "",
  phone: "",
  deliverymanId: "",
  address: {
    street: "",
    neighborhood: "",
    numberHouse: "",
    reference: "",
    city: "",
  },
  quantity: "",
  amount: "",
};

type FormErrors = {
  name?: string;
  lastName?: string;
  phone?: string;
  address?: Partial<AddressValues>;
  quantity?: string;
  amount?: string;
};

const validate = (values: DeliveryFormValues): FormErrors => {
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
  if (!values.quantity || Number(values.quantity) <= 0)
    errors.quantity = "Informe a quantidade.";
  if (values.amount === "" || Number(values.amount) <= 0)
    errors.amount = "Informe o valor.";

  return errors;
};

interface EntregaFormProps {
  onClose?: () => void;
}

const EntregaForm: React.FC<EntregaFormProps> = ({ onClose }) => {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [registers, setRegisters] = useState<RegisterResult[]>([]);
  const [registersLoading, setRegistersLoading] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState<number | null>(null);
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodOption[]>([]);
  const [skipPrintPreview, setSkipPrintPreview] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DELIVERY_PRINT_PREF_KEY) === "1";
  });
  const [sheetData, setSheetData] = useState<DeliverySheetData | null>(null);
  const [sheetFormat, setSheetFormat] = useState<DeliverySheetFormat>(DELIVERY_DEFAULT_SHEET_FORMAT);

  useEffect(() => {
    api
      .get("/register")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data.filter((r: RegisterResult) => r && r.client && r.address)
          : [];
        setRegisters(data);
        setRegistersLoading(false);
      })
      .catch(() => {
        setRegistersLoading(false);
      });
    api
      .get<DeliverymanOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
    api
      .get<CityOption[]>("/city")
      .then((res) => setCities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCities([]));
    api
      .get<NeighborhoodOption[]>("/neighborhood")
      .then((res) =>
        setNeighborhoods(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => setNeighborhoods([]));
  }, []);

  const handleSubmit = async (
    values: DeliveryFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      let registerId: number;

      if (selectedRegisterId) {
        registerId = selectedRegisterId;
      } else {
        const registerRes = await api.post("/register", {
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
        registerId = registerRes.data.id;
      }

      const orderPayload: {
        registerId: number;
        deliverymanId?: number;
        quantity: string;
        amount: number;
      } = {
        registerId,
        quantity: String(values.quantity),
        amount: Number(values.amount),
      };

      if (values.deliverymanId) {
        orderPayload.deliverymanId = Number(values.deliverymanId);
      }

      const orderRes = await api.post("/orderDelivery", orderPayload);

      const createdSheetData: DeliverySheetData = {
        orderId: typeof orderRes?.data?.id === "number" ? orderRes.data.id : null,
        createdAt: new Date().toISOString(),
        name: values.name,
        lastName: values.lastName,
        phone: values.phone,
        street: values.address.street,
        neighborhood: values.address.neighborhood,
        numberHouse: values.address.numberHouse,
        reference: values.address.reference,
        city: values.address.city,
        quantity: String(values.quantity),
        amount: Number(values.amount),
      };
      // flushSync força o React a renderizar a folha antes de converter em PDF,
      // garantindo que printRef já contém os dados do pedido atual.
      flushSync(() => setSheetData(createdSheetData));

      if (printRef.current) {
        const timestamp = new Date(createdSheetData.createdAt).getTime();
        const paperWidthMm =
          sheetFormat === "thermal80" ? 80 : sheetFormat === "thermal58" ? 58 : undefined;
        await exportHtmlToPdf({
          element: printRef.current,
          fileName: `folha-entrega-${createdSheetData.orderId ?? timestamp}`,
          margin: paperWidthMm ? 3 : 8,
          paperWidthMm,
          output: skipPrintPreview ? "print" : "open",
        });
      }

      setSnackbar({ open: true, message: "Pedido criado com sucesso!", severity: "success" });
      setSelectedRegisterId(null);
      resetForm();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ??
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ??
        "Erro ao criar pedido. Tente novamente.";
      console.error("[EntregaForm] erro ao criar pedido:", err);
      setSnackbar({
        open: true,
        message: msg,
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
          maxWidth: 960,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid", borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {/* Título */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ width: 40 }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
            Novo pedido de entrega
          </Typography>
          {onClose ? (
            <IconButton onClick={onClose} size="small" aria-label="fechar">
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} />
          )}
        </Box>
        <Divider sx={{ mb: 4 }} />

        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setValues, setFieldValue }) => {
            const selectedCity = cities.find((c) => c.name === values.address.city);
            const neighborhoodSuggestions = selectedCity
              ? neighborhoods.filter((n) => n.cityId === selectedCity.id)
              : neighborhoods;

            return (
            <Form noValidate>

              {/* ── Buscar cliente existente ──────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Buscar cliente existente
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <FieldLabel label="Pesquisar por nome" />
                  <Autocomplete
                    options={registers}
                    loading={registersLoading}
                    getOptionLabel={(option) =>
                      `${option.client.name} ${option.client.lastName}`
                    }
                    filterOptions={(options, { inputValue }) => {
                      const term = inputValue.toLowerCase();
                      return options.filter(
                        (o) =>
                          o.client.name.toLowerCase().includes(term) ||
                          o.client.lastName.toLowerCase().includes(term)
                      );
                    }}
                    onChange={(_, selected) => {
                      if (selected) {
                        setSelectedRegisterId(selected.id);
                        setValues({
                          ...values,
                          name: selected.client.name,
                          lastName: selected.client.lastName,
                          phone: phoneMask(selected.client.phone),
                          address: {
                            street: selected.address.street,
                            neighborhood: selected.address.neighborhood,
                            numberHouse: String(selected.address.numberHouse),
                            reference: selected.address.reference ?? "",
                            city: selected.address.city,
                          },
                        });
                      } else {
                        setSelectedRegisterId(null);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        fullWidth
                        placeholder="Digite o nome do cliente..."
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ── Dados do Cliente ──────────────────────────────── */}
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

              {/* ── Endereço de Entrega ───────────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Endereço de entrega
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
                    fullWidth size="small"
                    placeholder="Digite a cidade"
                    name="address.city" value={values.address.city}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("address.neighborhood", "");
                    }}
                    onBlur={handleBlur}
                    inputProps={{ list: "delivery-city-options" }}
                    error={Boolean(touched.address?.city && errors.address?.city)}
                    helperText={touched.address?.city && errors.address?.city}
                  />
                  <datalist id="delivery-city-options">
                    {cities.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Bairro *" />
                  <TextField
                    fullWidth size="small"
                    placeholder="Digite o bairro"
                    name="address.neighborhood" value={values.address.neighborhood}
                    onChange={handleChange} onBlur={handleBlur}
                    inputProps={{ list: "delivery-neighborhood-options" }}
                    error={Boolean(touched.address?.neighborhood && errors.address?.neighborhood)}
                    helperText={touched.address?.neighborhood && errors.address?.neighborhood}
                  />
                  <datalist id="delivery-neighborhood-options">
                    {neighborhoodSuggestions.map((b) => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
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

              <Divider sx={{ my: 3 }} />

              {/* ── Detalhes do Pedido ────────────────────────────── */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Detalhes do pedido
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
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
                    {deliverymen.map((deliveryman) => (
                      <MenuItem key={deliveryman.id} value={String(deliveryman.id)}>
                        {deliveryman.name} {deliveryman.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Quantidade *" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: 5"
                    type="number"
                    slotProps={{ htmlInput: { min: 1 } }}
                    name="quantity" value={values.quantity}
                    onChange={handleChange} onBlur={handleBlur}
                    error={Boolean(touched.quantity && errors.quantity)}
                    helperText={touched.quantity && errors.quantity}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Valor *" />
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

              {/* ── Ações ─────────────────────────────────────────── */}
              <Divider sx={{ mt: 3, mb: 3 }} />
              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Formato da folha" />
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={sheetFormat}
                    onChange={(event) => setSheetFormat(event.target.value as DeliverySheetFormat)}
                  >
                    <MenuItem value="a4">A4</MenuItem>
                    <MenuItem value="thermal80">Termica 80mm</MenuItem>
                    <MenuItem value="thermal58">Termica 58mm</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <FormControlLabel
                sx={{ mb: 1 }}
                control={(
                  <Checkbox
                    size="small"
                    checked={skipPrintPreview}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSkipPrintPreview(checked);
                      window.localStorage.setItem(
                        DELIVERY_PRINT_PREF_KEY,
                        checked ? "1" : "0"
                      );
                    }}
                  />
                )}
                label="Não mostrar novamente (imprimir folha direto)"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button type="reset" variant="outlined" color="inherit" disabled={isSubmitting}
                  sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary" }}
                  onClick={() => setSelectedRegisterId(null)}
                >
                  Limpar
                </Button>
                <Button
                  type="submit" variant="contained" disabled={isSubmitting}
                  sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" } }}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {isSubmitting ? "Enviando..." : "Criar pedido"}
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

      {sheetData && (
        <Box
          ref={printRef}
          sx={{
            width:
              sheetFormat === "thermal80"
                ? "302px"
                : sheetFormat === "thermal58"
                  ? "219px"
                  : "794px",
            position: "fixed",
            left: "-99999px",
            top: 0,
            bgcolor: "#fff",
            color: "#111",
            p: sheetFormat === "a4" ? 4 : 1.5,
            border: "1px solid #d0d0d0",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: sheetFormat === "a4" ? "inherit" : "11px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid #111",
              pb: 1.5,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: sheetFormat === "a4" ? 24 : 15,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                }}
              >
                {DELIVERY_COMPANY_NAME}
              </Typography>
              {DELIVERY_COMPANY_DOCUMENT ? (
                <Typography sx={{ fontSize: 11, color: "#444" }}>
                  Documento: {DELIVERY_COMPANY_DOCUMENT}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: sheetFormat === "a4" ? 20 : 12, fontWeight: 700 }}>
                FOLHA DE ENTREGA
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#444" }}>
                Emitido em {new Date(sheetData.createdAt).toLocaleString("pt-BR")}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={1.2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ border: "1px solid #111", p: 1.2, minHeight: 62 }}>
                <Typography sx={{ fontSize: 10, color: "#555", mb: 0.3 }}>Pedido</Typography>
                <Typography sx={{ fontSize: sheetFormat === "a4" ? 18 : 13, fontWeight: 700 }}>
                  #{sheetData.orderId ?? "-"}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ border: "1px solid #111", p: 1.2, minHeight: 62 }}>
                <Typography sx={{ fontSize: 10, color: "#555", mb: 0.3 }}>Quantidade</Typography>
                <Typography sx={{ fontSize: sheetFormat === "a4" ? 18 : 13, fontWeight: 700 }}>
                  {sheetData.quantity}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ border: "1px solid #111", p: 1.2, minHeight: 62 }}>
                <Typography sx={{ fontSize: 10, color: "#555", mb: 0.3 }}>Valor</Typography>
                <Typography sx={{ fontSize: sheetFormat === "a4" ? 18 : 13, fontWeight: 700 }}>
                  {CURRENCY_FORMATTER.format(sheetData.amount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ border: "1px solid #111", p: 1.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: 11, color: "#555", mb: 0.6 }}>Cliente</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.3 }}>
              {sheetData.name} {sheetData.lastName}
            </Typography>
            <Typography sx={{ fontSize: 12 }}>Telefone: {sheetData.phone}</Typography>
          </Box>

          <Box sx={{ border: "1px solid #111", p: 1.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: 11, color: "#555", mb: 0.6 }}>Endereço de entrega</Typography>
            <Typography sx={{ fontSize: 12, mb: 0.3 }}>
              {sheetData.street}, {sheetData.numberHouse}
            </Typography>
            <Typography sx={{ fontSize: 12, mb: 0.3 }}>
              {sheetData.neighborhood} - {sheetData.city}
            </Typography>
            <Typography sx={{ fontSize: 12 }}>
              Referência: {sheetData.reference || "Sem referência"}
            </Typography>
          </Box>

          <Box sx={{ border: "1px solid #111", p: 1.5, mb: 2.5, minHeight: sheetFormat === "a4" ? 72 : 56 }}>
            <Typography sx={{ fontSize: 11, color: "#555", mb: 0.6 }}>Observações da entrega</Typography>
            <Typography sx={{ fontSize: 12, color: "#777" }}>
              _________________________________________________________________________________
            </Typography>
            {sheetFormat === "a4" ? (
              <Typography sx={{ fontSize: 12, color: "#777" }}>
                _________________________________________________________________________________
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              mt: sheetFormat === "a4" ? 7 : 3,
              gap: 1,
            }}
          >
            <Box sx={{ width: "31%", borderTop: "1px solid #111", pt: 0.8 }}>
              <Typography variant="caption">Assinatura do entregador</Typography>
            </Box>
            <Box sx={{ width: "31%", borderTop: "1px solid #111", pt: 0.8 }}>
              <Typography variant="caption">Assinatura do cliente</Typography>
            </Box>
            <Box sx={{ width: "31%", borderTop: "1px solid #111", pt: 0.8 }}>
              <Typography variant="caption">Data e hora do recebimento</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

/** Label estático acima do campo */
const FieldLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: "text.secondary" }}>
    {label}
  </Typography>
);

export default EntregaForm;
