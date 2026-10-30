import { useState, type ReactNode } from "react";
import {
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Switch,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { currencyInputMask } from "@/shared/lib/masks";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  initialProductImage,
  toProductFormValues,
  toProductInput,
  validateProductForm,
  type Product,
  type ProductInput,
} from "../../domain/product";
import ProductImagePicker from "./ProductImagePicker";
import ProductVariationsField from "./ProductVariationsField";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (input: ProductInput) => Promise<boolean>;
  onImageError: (message: string) => void;
  resetOnSuccess?: boolean;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const ProductForm = ({
  product = null,
  onSubmit,
  onImageError,
  resetOnSuccess = false,
  children,
}: ProductFormProps) => {
  const [image, setImage] = useState(() => initialProductImage(product));

  return (
    <Formik
      initialValues={toProductFormValues(product)}
      validate={validateProductForm}
      onSubmit={async (values, { resetForm }) => {
        const succeeded = await onSubmit(toProductInput(values, image));
        if (succeeded && resetOnSuccess) {
          resetForm();
          setImage(initialProductImage());
        }
      }}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form noValidate>
          {children({
            submitting: isSubmitting,
            fields: (
              <>
                <FormSectionTitle title="Dados do produto" />
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <FormTextField
                      name="name"
                      label="Nome *"
                      placeholder="Ex: Refrigerante 2L"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="price"
                      label="Preço *"
                      placeholder="0,00"
                      mask={currencyInputMask}
                      slotProps={{
                        htmlInput: { inputMode: "numeric" },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                R$
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="category"
                      label="Categoria *"
                      placeholder="Ex: Bebidas"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="subcategory"
                      label="Subcategoria"
                      placeholder="Ex: Refrigerantes"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <FormTextField
                      name="description"
                      label="Descrição *"
                      placeholder="Breve descrição do produto"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mt: 1, mb: 2.5 }} />
                <FormSectionTitle title="Identificação e classificação" />
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="brand"
                      label="Marca"
                      placeholder="Ex: Coca-Cola"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="model"
                      label="Modelo"
                      placeholder="Ex: Zero Açúcar"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="unit"
                      label="Unidade de medida"
                      placeholder="Ex: un., kg, L, caixa"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="barcode"
                      label="Código de barras"
                      placeholder="Ex: 7891234567890"
                    />
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <FormControlLabel
                      sx={{ mt: 2 }}
                      control={
                        <Switch
                          checked={values.status}
                          onChange={(e) =>
                            void setFieldValue("status", e.target.checked)
                          }
                        />
                      }
                      label={
                        values.status ? "Produto ativo" : "Produto inativo"
                      }
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <FormTextField
                      name="notes"
                      label="Observações"
                      placeholder="Observações internas sobre o produto"
                      multiline
                      minRows={2}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mt: 1, mb: 2.5 }} />
                <FormSectionTitle title="Imagem do produto" />
                <ProductImagePicker
                  preview={image.preview}
                  onSelect={(preview, mimeType) =>
                    setImage({ preview, mimeType, status: "replaced" })
                  }
                  onRemove={() =>
                    setImage({
                      preview: null,
                      mimeType: null,
                      status: "removed",
                    })
                  }
                  onError={onImageError}
                />

                <Divider sx={{ mt: 1, mb: 2.5 }} />
                <FormSectionTitle title="Variações (tamanho, cor, voltagem etc.)" />
                <ProductVariationsField variations={values.variations} />
              </>
            ),
          })}
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
