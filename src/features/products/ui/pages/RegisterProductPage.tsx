import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { useToast } from "@/shared/ui/feedback/useToast";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import { toProductErrorMessage, type ProductInput } from "../../domain/product";
import { useCreateProduct } from "../../application/productQueries";
import ProductForm from "../components/ProductForm";

const RegisterProductPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const createProduct = useCreateProduct();

  const handleCreate = async (input: ProductInput) => {
    try {
      await createProduct.mutateAsync(input);
      toast.success("Produto cadastrado com sucesso!");
      return true;
    } catch (error) {
      toast.error(toProductErrorMessage(error, false));
      return false;
    }
  };

  return (
    <FormCard
      title="Cadastrar produto"
      onBack={() => navigate(ROUTES.dashboard)}
    >
      <ProductForm
        onSubmit={handleCreate}
        onImageError={toast.error}
        resetOnSuccess
      >
        {({ fields, submitting }) => (
          <>
            {fields}
            <FormActions submitting={submitting} />
          </>
        )}
      </ProductForm>
    </FormCard>
  );
};

export default RegisterProductPage;
