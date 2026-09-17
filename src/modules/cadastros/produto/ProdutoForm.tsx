import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { Formik, Form, FieldArray } from "formik";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { currencyInputMask, formatCurrencyFromNumber, parseCurrencyToNumber } from "../../../helpers/masks";
import { toProductImageSrc, type Product } from "../../../types/Product";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface ProdutoVariationValues {
  attribute: string;
  value: string;
}

interface ProdutoFormValues {
  name: string;
  price: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  unit: string;
  barcode: string;
  status: boolean;
  notes: string;
  variations: ProdutoVariationValues[];
}

const buildInitialValues = (product?: Product | null): ProdutoFormValues => ({
  name: product?.name ?? "",
  price: product ? formatCurrencyFromNumber(Number(product.price)) : "",
  description: product?.description ?? "",
  category: product?.category ?? "",
  subcategory: product?.subcategory ?? "",
  brand: product?.brand ?? "",
  model: product?.model ?? "",
  unit: product?.unit ?? "",
  barcode: product?.barcode ?? "",
  status: product?.status ?? true,
  notes: product?.notes ?? "",
  variations: product?.variations?.map((v) => ({ attribute: v.attribute, value: v.value })) ?? [],
});

const emptyToNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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

interface ProdutoFormProps {
  /** Quando true, remove o Paper/cabeçalho próprio para uso dentro de um Dialog que já fornece esse chrome. */
  embedded?: boolean;
  /** Presente = modo edição (PUT); ausente = modo criação (POST). */
  product?: Product | null;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

const ProdutoForm: React.FC<ProdutoFormProps> = ({ embedded = false, product = null, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const isEdit = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    toProductImageSrc(product?.imageBase64, product?.imageMimeType)
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    setImagePreview(toProductImageSrc(product?.imageBase64, product?.imageMimeType));
    setSelectedFile(null);
    setImageRemoved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({ open: true, message: "Selecione uma imagem válida.", severity: "error" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setSnackbar({ open: true, message: "A imagem não pode ter mais de 5MB.", severity: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setSelectedFile(file);
        setImageRemoved(false);
      }
    };
    reader.onerror = () => setSnackbar({ open: true, message: "Falha ao ler a imagem.", severity: "error" });
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setImageRemoved(true);
  };

  const handleSubmit = async (
    values: ProdutoFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: Record<string, unknown> = {
        name: values.name.trim(),
        price: parseCurrencyToNumber(values.price),
        description: values.description.trim(),
        category: values.category.trim(),
        subcategory: emptyToNull(values.subcategory),
        brand: emptyToNull(values.brand),
        model: emptyToNull(values.model),
        unit: emptyToNull(values.unit),
        barcode: emptyToNull(values.barcode),
        status: values.status,
        notes: emptyToNull(values.notes),
        variations: values.variations
          .filter((v) => v.attribute.trim() && v.value.trim())
          .map((v) => ({ attribute: v.attribute.trim(), value: v.value.trim() })),
      };

      if (selectedFile) {
        payload.imageBase64 = imagePreview;
        payload.imageMimeType = selectedFile.type;
      } else if (imageRemoved) {
        payload.imageBase64 = null;
        payload.imageMimeType = null;
      }

      const response =
        isEdit && product
          ? await api.put(`/product/${product.id}`, payload)
          : await api.post("/product", payload);

      setSnackbar({
        open: true,
        message: isEdit ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!",
        severity: "success",
      });

      onSuccess?.(response.data);

      if (!isEdit) {
        resetForm();
        setImagePreview(null);
        setSelectedFile(null);
        setImageRemoved(false);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const rawMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      const message =
        rawMessage === "Invalid param: barcode"
          ? "Já existe um produto com esse código de barras."
          : rawMessage || `Erro ao ${isEdit ? "atualizar" : "cadastrar"} produto. Tente novamente.`;
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  const Container: React.ElementType = embedded ? Box : Paper;

  return (
    <>
      <Container
        elevation={embedded ? undefined : 0}
        sx={
          embedded
            ? { p: 0 }
            : {
                p: { xs: 2, sm: 3, md: 4 },
                width: "100%",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                backdropFilter: "blur(2px)",
              }
        }
      >
        {!embedded && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
              <IconButton size="small" onClick={() => navigate("/dashboard")}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
                Cadastrar produto
              </Typography>
              <Box sx={{ width: 32 }} />
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        <Formik
          initialValues={buildInitialValues(product)}
          enableReinitialize
          validate={validate}
          onSubmit={handleSubmit}
        >
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
                  <FieldLabel label="Subcategoria" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Refrigerantes"
                    name="subcategory" value={values.subcategory}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 12 }}>
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

              <Divider sx={{ mt: 1, mb: 2.5 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Identificação e classificação
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Marca" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Coca-Cola"
                    name="brand" value={values.brand}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Modelo" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: Zero Açúcar"
                    name="model" value={values.model}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel label="Unidade de medida" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: un., kg, L, caixa"
                    name="unit" value={values.unit}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel label="Código de barras" />
                  <TextField
                    fullWidth size="small" placeholder="Ex: 7891234567890"
                    name="barcode" value={values.barcode}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    sx={{ mt: 2 }}
                    control={
                      <Switch
                        checked={values.status}
                        onChange={(e) => setFieldValue("status", e.target.checked)}
                      />
                    }
                    label={values.status ? "Produto ativo" : "Produto inativo"}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <FieldLabel label="Observações" />
                  <TextField
                    fullWidth size="small" multiline minRows={2}
                    placeholder="Observações internas sobre o produto"
                    name="notes" value={values.notes}
                    onChange={handleChange} onBlur={handleBlur}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mt: 1, mb: 2.5 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Imagem do produto
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                {imagePreview ? (
                  <Paper
                    variant="outlined"
                    sx={{ position: "relative", width: 120, height: 120, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}
                  >
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Pré-visualização do produto"
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "rgba(255,255,255,1)" } }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ) : null}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhotoCameraOutlinedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? "Alterar imagem" : "Adicionar imagem"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Stack>

              <Divider sx={{ mt: 1, mb: 2.5 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                Variações (tamanho, cor, voltagem etc.)
              </Typography>

              <FieldArray name="variations">
                {({ push, remove }) => (
                  <Stack spacing={1.5} sx={{ mb: 1 }}>
                    {values.variations.map((variation, index) => (
                      <Grid container spacing={1.5} key={index} alignItems="center">
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField
                            fullWidth size="small" placeholder="Atributo (Ex: Tamanho)"
                            name={`variations.${index}.attribute`}
                            value={variation.attribute}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField
                            fullWidth size="small" placeholder="Valor (Ex: M)"
                            name={`variations.${index}.value`}
                            value={variation.value}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <IconButton size="small" color="error" onClick={() => remove(index)}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => push({ attribute: "", value: "" })}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Adicionar variação
                    </Button>
                  </Stack>
                )}
              </FieldArray>

              <Divider sx={{ mt: 2.5, mb: 2.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "stretch", sm: "flex-end" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.25,
                }}
              >
                {embedded && onCancel ? (
                  <Button
                    onClick={onCancel}
                    disabled={isSubmitting}
                    sx={{ textTransform: "none", width: { xs: "100%", sm: "auto" } }}
                  >
                    Cancelar
                  </Button>
                ) : null}
                <Button
                  type="submit" variant="contained" disabled={isSubmitting}
                  sx={{ textTransform: "none", bgcolor: "#4361EE", "&:hover": { bgcolor: "#3451D1" }, width: { xs: "100%", sm: "auto" } }}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Container>

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
