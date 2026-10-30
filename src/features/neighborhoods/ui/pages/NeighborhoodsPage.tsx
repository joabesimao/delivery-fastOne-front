import { useState } from "react";
import { Box } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useCities } from "@/features/cities";
import { getBusyRowId } from "@/shared/lib/query/createCrudQueries";
import SectionHeader from "@/shared/ui/SectionHeader";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import {
  emptyNeighborhoodForm,
  type Neighborhood,
  type NeighborhoodInput,
} from "../../domain/neighborhood";
import {
  useCreateNeighborhood,
  useDeleteNeighborhood,
  useNeighborhoods,
  useUpdateNeighborhood,
} from "../../application/neighborhoodQueries";
import NeighborhoodEditDialog from "../components/NeighborhoodEditDialog";
import NeighborhoodForm from "../components/NeighborhoodForm";
import NeighborhoodTable from "../components/NeighborhoodTable";

const NeighborhoodsPage = () => {
  const runWithFeedback = useActionFeedback();

  const neighborhoodsQuery = useNeighborhoods();
  const cities = useCities().data ?? [];
  const createNeighborhood = useCreateNeighborhood();
  const updateNeighborhood = useUpdateNeighborhood();
  const deleteNeighborhood = useDeleteNeighborhood();

  const [editing, setEditing] = useState<Neighborhood | null>(null);
  const [deleting, setDeleting] = useState<Neighborhood | null>(null);

  const handleCreate = (input: NeighborhoodInput) =>
    runWithFeedback(() => createNeighborhood.mutateAsync(input), {
      success: "Bairro cadastrado com sucesso!",
      error: "Erro ao cadastrar bairro. Tente novamente.",
      showApiError: false,
    });

  const handleUpdate = async (input: NeighborhoodInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateNeighborhood.mutateAsync({ id: editing.id, input }),
      {
        success: "Bairro atualizado com sucesso.",
        error: "Erro ao atualizar bairro. Tente novamente.",
        showApiError: false,
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteNeighborhood.mutateAsync(deleting.id),
      {
        success: "Bairro deletado com sucesso.",
        error: "Erro ao deletar bairro. Tente novamente.",
        showApiError: false,
      },
    );
    if (succeeded) setDeleting(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormCard title="Cadastrar bairro" maxWidth={720}>
        <NeighborhoodForm
          initialValues={emptyNeighborhoodForm}
          cities={cities}
          onSubmit={handleCreate}
          resetOnSuccess
        >
          {({ fields, submitting }) => (
            <>
              <FormSectionTitle title="Dados do bairro" />
              {fields}
              <FormActions submitting={submitting} resetLabel="Limpar" />
            </>
          )}
        </NeighborhoodForm>
      </FormCard>

      <Box>
        <SectionHeader icon={LocationOnIcon} title="Bairros cadastrados" />
        <NeighborhoodTable
          neighborhoods={neighborhoodsQuery.data ?? []}
          loading={neighborhoodsQuery.isPending}
          error={
            neighborhoodsQuery.isError
              ? "Erro ao carregar a lista de bairros."
              : null
          }
          busyNeighborhoodId={getBusyRowId(
            updateNeighborhood,
            deleteNeighborhood,
          )}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </Box>

      <NeighborhoodEditDialog
        neighborhood={editing}
        cities={cities}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar este bairro? Esta ação é irreversível."
        loading={deleteNeighborhood.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default NeighborhoodsPage;
