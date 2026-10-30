import { useState } from "react";
import { Box } from "@mui/material";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { getBusyRowId } from "@/shared/lib/query/createCrudQueries";
import SectionHeader from "@/shared/ui/SectionHeader";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import { emptyCityForm, type City, type CityInput } from "../../domain/city";
import {
  useCities,
  useCreateCity,
  useDeleteCity,
  useUpdateCity,
} from "../../application/cityQueries";
import CityEditDialog from "../components/CityEditDialog";
import CityForm from "../components/CityForm";
import CityTable from "../components/CityTable";

const CitiesPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();

  const citiesQuery = useCities();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const [editing, setEditing] = useState<City | null>(null);
  const [deleting, setDeleting] = useState<City | null>(null);

  const handleCreate = (input: CityInput) =>
    runWithFeedback(() => createCity.mutateAsync(input), {
      success: "Cidade cadastrada com sucesso!",
      error: "Erro ao cadastrar cidade. Tente novamente.",
      showApiError: false,
    });

  const handleUpdate = async (input: CityInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateCity.mutateAsync({ id: editing.id, input }),
      {
        success: "Cidade atualizada com sucesso.",
        error: "Erro ao atualizar cidade. Tente novamente.",
        showApiError: false,
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteCity.mutateAsync(deleting.id),
      {
        success: "Cidade deletada com sucesso.",
        error:
          "Erro ao deletar cidade. Verifique se não há bairros vinculados a ela.",
        showApiError: false,
      },
    );
    if (succeeded) setDeleting(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormCard
        title="Cadastrar cidade"
        onBack={() => navigate(ROUTES.dashboard)}
      >
        <CityForm
          initialValues={emptyCityForm}
          onSubmit={handleCreate}
          resetOnSuccess
        >
          {({ fields, submitting }) => (
            <>
              <FormSectionTitle title="Dados da cidade" />
              {fields}
              <FormActions submitting={submitting} />
            </>
          )}
        </CityForm>
      </FormCard>

      <Box>
        <SectionHeader icon={LocationCityIcon} title="Cidades cadastradas" />
        <CityTable
          cities={citiesQuery.data ?? []}
          loading={citiesQuery.isPending}
          error={
            citiesQuery.isError ? "Erro ao carregar a lista de cidades." : null
          }
          busyCityId={getBusyRowId(updateCity, deleteCity)}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </Box>

      <CityEditDialog
        city={editing}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar esta cidade? Bairros vinculados a ela impedem a exclusão."
        loading={deleteCity.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default CitiesPage;
