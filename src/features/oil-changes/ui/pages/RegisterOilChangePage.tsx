import { useNavigate } from "react-router-dom";
import { useFleetOptions } from "@/features/fleet";
import { ROUTES } from "@/shared/config/routes";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import {
  emptyOilChangeForm,
  type OilChangeInput,
} from "../../domain/oilChange";
import { useCreateOilChange } from "../../application/oilChangeQueries";
import OilChangeForm from "../components/OilChangeForm";

const RegisterOilChangePage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const fleet = useFleetOptions();
  const createOilChange = useCreateOilChange();

  const handleCreate = (input: OilChangeInput) =>
    runWithFeedback(() => createOilChange.mutateAsync(input), {
      success: "Troca de óleo lançada com sucesso!",
      error: "Erro ao lançar a troca de óleo. Tente novamente.",
    });

  return (
    <FormCard
      title="Lançar troca de óleo"
      onBack={() => navigate(ROUTES.oilChanges)}
    >
      <OilChangeForm
        initialValues={emptyOilChangeForm()}
        vehicleOptions={fleet.vehicleOptions}
        deliverymanOptions={fleet.deliverymanOptions}
        onSubmit={handleCreate}
        resetOnSuccess
      >
        {({ fields, submitting }) => (
          <>
            <FormSectionTitle title="Dados da troca" />
            {fields}
            <FormActions submitting={submitting} submitLabel="Lançar troca" />
          </>
        )}
      </OilChangeForm>
    </FormCard>
  );
};

export default RegisterOilChangePage;
