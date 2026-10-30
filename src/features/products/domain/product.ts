import {
  formatCurrencyFromNumber,
  parseCurrencyToNumber,
} from "@/shared/lib/masks";

export interface ProductVariation {
  id?: number;
  attribute: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  model?: string | null;
  unit?: string | null;
  barcode?: string | null;
  status: boolean;
  notes?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  variations?: ProductVariation[];
}

export interface ProductInput {
  name: string;
  price: number;
  description: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  model: string | null;
  unit: string | null;
  barcode: string | null;
  status: boolean;
  notes: string | null;
  variations: { attribute: string; value: string }[];
  imageBase64?: string | null;
  imageMimeType?: string | null;
}

export interface ProductFormValues {
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
  variations: { attribute: string; value: string }[];
}

export type ProductFormErrors = Partial<
  Record<"name" | "price" | "description" | "category", string>
>;

export interface ProductImage {
  preview: string | null;
  mimeType: string | null;
  status: "unchanged" | "replaced" | "removed";
}

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export const toProductImageSrc = (
  imageBase64?: string | null,
  imageMimeType?: string | null,
): string | null => {
  if (!imageBase64) return null;
  const normalizedMime = imageMimeType || "image/jpeg";
  return `data:${normalizedMime};base64,${imageBase64}`;
};

export const initialProductImage = (
  product?: Product | null,
): ProductImage => ({
  preview: toProductImageSrc(product?.imageBase64, product?.imageMimeType),
  mimeType: null,
  status: "unchanged",
});

export const validateProductImageFile = (file: {
  type: string;
  size: number;
}): string | null => {
  if (!file.type.startsWith("image/")) return "Selecione uma imagem válida.";
  if (file.size > MAX_PRODUCT_IMAGE_BYTES)
    return "A imagem não pode ter mais de 5MB.";
  return null;
};

export const toProductFormValues = (
  product?: Product | null,
): ProductFormValues => ({
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
  variations:
    product?.variations?.map((v) => ({
      attribute: v.attribute,
      value: v.value,
    })) ?? [],
});

export const validateProductForm = (
  values: ProductFormValues,
): ProductFormErrors => {
  const errors: ProductFormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome do produto.";
  if (!values.description.trim()) errors.description = "Informe a descrição.";
  if (!values.category.trim()) errors.category = "Informe a categoria.";
  const price = parseCurrencyToNumber(values.price);
  if (!values.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = "Informe um preço válido.";
  }
  return errors;
};

const emptyToNull = (value: string): string | null => value.trim() || null;

const toImageFields = (
  image: ProductImage,
): Pick<ProductInput, "imageBase64" | "imageMimeType"> => {
  if (image.status === "replaced")
    return { imageBase64: image.preview, imageMimeType: image.mimeType };
  if (image.status === "removed")
    return { imageBase64: null, imageMimeType: null };
  return {};
};

export const toProductInput = (
  values: ProductFormValues,
  image: ProductImage,
): ProductInput => ({
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
  ...toImageFields(image),
});

export const toProductErrorMessage = (
  error: unknown,
  isEdit: boolean,
): string => {
  const err = error as {
    response?: { data?: { error?: string; message?: string } };
    message?: string;
  };
  const rawMessage =
    err?.response?.data?.error || err?.response?.data?.message || err?.message;
  if (rawMessage === "Invalid param: barcode")
    return "Já existe um produto com esse código de barras.";
  return (
    rawMessage ||
    `Erro ao ${isEdit ? "atualizar" : "cadastrar"} produto. Tente novamente.`
  );
};
