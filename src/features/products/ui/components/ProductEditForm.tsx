import { useToast } from "@/shared/ui/feedback/useToast";
import FormActions from "@/shared/ui/form/FormActions";
import {
  toProductErrorMessage,
  type Product,
  type ProductInput,
} from "../../domain/product";
import { useUpdateProduct } from "../../application/productQueries";
import ProductForm from "./ProductForm";

interface ProductEditFormProps {
  product: Product;
  onCancel: () => void;
  onSaved: (product: Product) => void;
}

const ProductEditForm = ({
  product,
  onCancel,
  onSaved,
}: ProductEditFormProps) => {
  const toast = useToast();
  const updateProduct = useUpdateProduct();

  const handleUpdate = async (input: ProductInput) => {
    try {
      const saved = await updateProduct.mutateAsync({ id: product.id, input });
      toast.success("Produto atualizado com sucesso!");
      onSaved(saved);
      return true;
    } catch (error) {
      toast.error(toProductErrorMessage(error, true));
      return false;
    }
  };

  return (
    <ProductForm
      key={product.id}
      product={product}
      onSubmit={handleUpdate}
      onImageError={toast.error}
    >
      {({ fields, submitting }) => (
        <>
          {fields}
          <FormActions
            submitting={submitting}
            submitLabel="Salvar alterações"
            onCancel={onCancel}
          />
        </>
      )}
    </ProductForm>
  );
};

export default ProductEditForm;
