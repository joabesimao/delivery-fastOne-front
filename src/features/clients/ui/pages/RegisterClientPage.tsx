import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCities } from "@/features/cities";
import { useNeighborhoods } from "@/features/neighborhoods";
import { ROUTES } from "@/shared/config/routes";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import {
  emptyClientRegistrationForm,
  type ClientRegistrationFormValues,
  type ClientRegistrationInput,
  type RegisteredClient,
} from "../../domain/clientRegistration";
import { useRegisterClient } from "../../application/clientQueries";
import ClientRegistrationForm from "../components/ClientRegistrationForm";
import OfferDeliveryDialog from "../components/OfferDeliveryDialog";

const RegisterClientPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const cities = useCities().data ?? [];
  const neighborhoods = useNeighborhoods().data ?? [];
  const registerClient = useRegisterClient();

  const [registered, setRegistered] = useState<RegisteredClient | null>(null);

  const handleRegister = (
    input: ClientRegistrationInput,
    values: ClientRegistrationFormValues,
  ) =>
    runWithFeedback(
      async () => {
        const { id } = await registerClient.mutateAsync(input);
        setRegistered({ id, clientData: values });
      },
      {
        success: "Cliente cadastrado com sucesso!",
        error: "Erro ao cadastrar cliente. Tente novamente.",
      },
    );

  const startDelivery = () => {
    navigate(ROUTES.deliveries, {
      state: { openCreate: true, clientData: registered },
    });
  };

  return (
    <>
      <FormCard
        title="Cadastrar cliente"
        onBack={() => navigate(ROUTES.dashboard)}
      >
        <ClientRegistrationForm
          initialValues={emptyClientRegistrationForm}
          cities={cities}
          neighborhoods={neighborhoods}
          onSubmit={handleRegister}
        >
          {({ fields, submitting }) => (
            <>
              {fields}
              <FormActions submitting={submitting} />
            </>
          )}
        </ClientRegistrationForm>
      </FormCard>

      <OfferDeliveryDialog
        clientName={registered?.clientData.name ?? null}
        onAccept={startDelivery}
        onDecline={() => setRegistered(null)}
      />
    </>
  );
};

export default RegisterClientPage;
