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

export const toProductImageSrc = (
  imageBase64?: string | null,
  imageMimeType?: string | null,
): string | null => {
  if (!imageBase64) return null;
  const normalizedMime = imageMimeType || "image/jpeg";
  return `data:${normalizedMime};base64,${imageBase64}`;
};
