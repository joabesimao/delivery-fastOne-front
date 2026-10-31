import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import { useNavigate } from "react-router-dom";
import {
  FLEET_MANAGER_ROLES,
  FleetFilters,
  useFleetFilters,
  useFleetOptions,
} from "@/features/fleet";
import { ROUTES } from "@/shared/config/routes";
import { getBusyRowId } from "@/shared/lib/query/createCrudQueries";
import { session } from "@/shared/session/session";
import SectionHeader from "@/shared/ui/SectionHeader";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import type { OilChange, OilChangeInput } from "../../domain/oilChange";
import {
  useDeleteOilChange,
  useOilChanges,
  useUpdateOilChange,
} from "../../application/oilChangeQueries";
import OilChangeEditDialog from "../components/OilChangeEditDialog";
import OilChangeTable from "../components/OilChangeTable";

const OilChangesPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const filters = useFleetFilters();
  const fleet = useFleetOptions();
  const canManage = session.hasRole(FLEET_MANAGER_ROLES);

  const oilChangesQuery = useOilChanges(filters.params);
  const updateOilChange = useUpdateOilChange();
  const deleteOilChange = useDeleteOilChange();

  const [editing, setEditing] = useState<OilChange | null>(null);
  const [deleting, setDeleting] = useState<OilChange | null>(null);

  const handleUpdate = async (input: OilChangeInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateOilChange.mutateAsync({ id: editing.id, input }),
      {
        success: "Troca de óleo atualizada com sucesso.",
        error: "Erro ao atualizar troca de óleo. Tente novamente.",
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteOilChange.mutateAsync(deleting.id),
      {
        success: "Troca de óleo deletada com sucesso.",
        error: "Erro ao deletar troca de óleo. Tente novamente.",
      },
    );
    if (succeeded) setDeleting(null);
  };

  return (
    <Box>
      <SectionHeader
        icon={BuildIcon}
        title="Histórico de trocas de óleo"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.registerOilChange)}
            sx={{
              textTransform: "none",
              bgcolor: "#4361EE",
              "&:hover": { bgcolor: "#3451D1" },
            }}
          >
            Lançar troca de óleo
          </Button>
        }
      />

      <FleetFilters
        vehicleOptions={fleet.vehicleOptions}
        deliverymanOptions={fleet.deliverymanOptions}
        vehicleId={filters.vehicleId}
        deliverymanId={filters.deliverymanId}
        onVehicleChange={filters.setVehicleId}
        onDeliverymanChange={filters.setDeliverymanId}
        onClear={filters.clear}
      />

      <OilChangeTable
        oilChanges={oilChangesQuery.data ?? []}
        loading={oilChangesQuery.isPending}
        error={
          oilChangesQuery.isError
            ? "Erro ao carregar o histórico de trocas de óleo."
            : null
        }
        emptyMessage={
          filters.hasFilters
            ? "Nenhuma troca de óleo encontrada para os filtros selecionados."
            : "Nenhuma troca de óleo lançada."
        }
        canManage={canManage}
        busyId={getBusyRowId(updateOilChange, deleteOilChange)}
        vehicleLabelOf={fleet.vehicleLabelOf}
        deliverymanLabelOf={fleet.deliverymanLabelOf}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <OilChangeEditDialog
        oilChange={editing}
        vehicleOptions={fleet.vehicleOptions}
        deliverymanOptions={fleet.deliverymanOptions}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar esta troca de óleo?"
        loading={deleteOilChange.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default OilChangesPage;
