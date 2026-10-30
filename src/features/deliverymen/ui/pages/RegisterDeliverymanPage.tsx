import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import {
  collectRegisteredDocuments,
  emptyDeliverymanForm,
  type DeliverymanInput,
} from "../../domain/deliveryman";
import {
  useCreateDeliveryman,
  useDeliverymen,
} from "../../application/deliverymanQueries";
import DeliverymanForm from "../components/DeliverymanForm";

const RegisterDeliverymanPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const { data: deliverymen } = useDeliverymen();
  const createDeliveryman = useCreateDeliveryman();

  const registeredDocuments = useMemo(
    () => collectRegisteredDocuments(deliverymen ?? []),
    [deliverymen],
  );

  const handleCreate = (input: DeliverymanInput) =>
    runWithFeedback(() => createDeliveryman.mutateAsync(input), {
      success: "Entregador cadastrado com sucesso!",
      error: "Erro ao cadastrar entregador. Tente novamente.",
    });

  return (
    <FormCard
      title="Cadastrar entregador"
      onBack={() => navigate(ROUTES.dashboard)}
    >
      <DeliverymanForm
        initialValues={emptyDeliverymanForm}
        registeredDocuments={registeredDocuments}
        onSubmit={handleCreate}
        resetOnSuccess
      >
        {({ fields, submitting }) => (
          <>
            <FormSectionTitle title="Dados do entregador" />
            {fields}
            <FormActions submitting={submitting} />
          </>
        )}
      </DeliverymanForm>
    </FormCard>
  );
};

export default RegisterDeliverymanPage;
