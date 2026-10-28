import { useState } from "react";
import { Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useNavigate } from "react-router-dom";
import { useDeliverymen } from "@/features/deliverymen";
import { ROUTES } from "@/shared/config/routes";
import { extractApiErrorMessage } from "@/shared/lib/errors/extractApiErrorMessage";
import SectionHeader from "@/shared/ui/SectionHeader";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useToast } from "@/shared/ui/feedback/useToast";
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
  const toast = useToast();

  const vehiclesQuery = useVehicles();
  const deliverymen = useDeliverymen().data ?? [];
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const runWithFeedback = async (
    action: () => Promise<void>,
    successMessage: string,
    errorMessage: string,
  ): Promise<boolean> => {
    try {
      await action();
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, errorMessage));
      return false;
    }
  };

  const handleCreate = (input: VehicleInput) =>
    runWithFeedback(
      () => createVehicle.mutateAsync(input),
      "Veículo cadastrado com sucesso!",
      "Erro ao cadastrar veículo. Tente novamente.",
    );

  const handleUpdate = async (input: VehicleInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateVehicle.mutateAsync({ id: editing.id, input }),
      "Veículo atualizado com sucesso.",
      "Erro ao atualizar veículo. Tente novamente.",
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteVehicle.mutateAsync(deleting.id),
      "Veículo deletado com sucesso.",
      "Erro ao deletar veículo. Tente novamente.",
    );
    if (succeeded) setDeleting(null);
  };

  const busyVehicleId =
    (updateVehicle.isPending && updateVehicle.variables?.id) ||
    (deleteVehicle.isPending && deleteVehicle.variables) ||
    null;

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
