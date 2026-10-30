import { useState } from "react";
import { Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useNavigate } from "react-router-dom";
import { useDeliverymen } from "@/features/deliverymen";
import { ROUTES } from "@/shared/config/routes";
import { getBusyRowId } from "@/shared/lib/query/createCrudQueries";
import SectionHeader from "@/shared/ui/SectionHeader";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormActions from "@/shared/ui/form/FormActions";
import FormCard from "@/shared/ui/form/FormCard";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import {
  emptyVehicleForm,
  type Vehicle,
  type VehicleInput,
} from "../../domain/vehicle";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicles,
} from "../../application/vehicleQueries";
import VehicleEditDialog from "../components/VehicleEditDialog";
import VehicleForm from "../components/VehicleForm";
import VehicleTable from "../components/VehicleTable";

const VehiclesPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();

  const vehiclesQuery = useVehicles();
  const deliverymen = useDeliverymen().data ?? [];
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const handleCreate = (input: VehicleInput) =>
    runWithFeedback(() => createVehicle.mutateAsync(input), {
      success: "Veículo cadastrado com sucesso!",
      error: "Erro ao cadastrar veículo. Tente novamente.",
    });

  const handleUpdate = async (input: VehicleInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateVehicle.mutateAsync({ id: editing.id, input }),
      {
        success: "Veículo atualizado com sucesso.",
        error: "Erro ao atualizar veículo. Tente novamente.",
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteVehicle.mutateAsync(deleting.id),
      {
        success: "Veículo deletado com sucesso.",
        error: "Erro ao deletar veículo. Tente novamente.",
      },
    );
    if (succeeded) setDeleting(null);
  };

  const busyVehicleId = getBusyRowId(updateVehicle, deleteVehicle);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormCard
        title="Cadastrar veículo"
        onBack={() => navigate(ROUTES.dashboard)}
      >
        <VehicleForm
          initialValues={emptyVehicleForm}
          deliverymen={deliverymen}
          onSubmit={handleCreate}
          resetOnSuccess
        >
          {({ fields, submitting }) => (
            <>
              <FormSectionTitle title="Dados do veículo" />
              {fields}
              <FormActions submitting={submitting} />
            </>
          )}
        </VehicleForm>
      </FormCard>

      <Box>
        <SectionHeader icon={DirectionsCarIcon} title="Veículos cadastrados" />
        <VehicleTable
          vehicles={vehiclesQuery.data ?? []}
          deliverymen={deliverymen}
          loading={vehiclesQuery.isPending}
          error={
            vehiclesQuery.isError
              ? "Erro ao carregar a lista de veículos."
              : null
          }
          busyVehicleId={busyVehicleId}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </Box>

      <VehicleEditDialog
        vehicle={editing}
        deliverymen={deliverymen}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar este veículo? Registros de troca de óleo e abastecimento vinculados a ele impedem a exclusão."
        loading={deleteVehicle.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default VehiclesPage;
