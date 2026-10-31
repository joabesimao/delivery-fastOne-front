import { useNavigate } from "react-router-dom";
import { useFleetOptions } from "@/features/fleet";
import { ROUTES } from "@/shared/config/routes";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import {
  emptyFuelRefillForm,
  type FuelRefillInput,
} from "../../domain/fuelRefill";
import { useCreateFuelRefill } from "../../application/fuelRefillQueries";
import FuelRefillForm from "../components/FuelRefillForm";

const RegisterFuelRefillPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const fleet = useFleetOptions();
  const createFuelRefill = useCreateFuelRefill();

  const handleCreate = (input: FuelRefillInput) =>
    runWithFeedback(() => createFuelRefill.mutateAsync(input), {
      success: "Abastecimento lançado com sucesso!",
      error: "Erro ao lançar o abastecimento. Tente novamente.",
    });

  return (
    <FormCard
      title="Lançar abastecimento"
      onBack={() => navigate(ROUTES.fuelRefills)}
    >
      <FuelRefillForm
        initialValues={emptyFuelRefillForm()}
        vehicleOptions={fleet.vehicleOptions}
        deliverymanOptions={fleet.deliverymanOptions}
        onSubmit={handleCreate}
        resetOnSuccess
      >
        {({ fields, submitting }) => (
          <>
            <FormSectionTitle title="Dados do abastecimento" />
            {fields}
            <FormActions
              submitting={submitting}
              submitLabel="Lançar abastecimento"
            />
          </>
        )}
      </FuelRefillForm>
    </FormCard>
  );
};

export default RegisterFuelRefillPage;
