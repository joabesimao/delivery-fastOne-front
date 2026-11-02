import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import type { Product } from "../../domain/product";
import ProductEditForm from "./ProductEditForm";

interface ProductEditDialogProps {
  product: Product | null;
  onClose: () => void;
}

const ProductEditDialog = ({ product, onClose }: ProductEditDialogProps) => (
  <Dialog open={Boolean(product)} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Editar produto</DialogTitle>
    <DialogContent dividers>
      {product && (
        <ProductEditForm
          product={product}
          onCancel={onClose}
          onSaved={onClose}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default ProductEditDialog;
