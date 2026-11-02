import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
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
import type { FuelRefill, FuelRefillInput } from "../../domain/fuelRefill";
import {
  useDeleteFuelRefill,
  useFuelRefills,
  useUpdateFuelRefill,
} from "../../application/fuelRefillQueries";
import FuelRefillEditDialog from "../components/FuelRefillEditDialog";
import FuelRefillTable from "../components/FuelRefillTable";

import { COLORS } from "@/shared/theme/colors";
const FuelRefillsPage = () => {
  const navigate = useNavigate();
  const runWithFeedback = useActionFeedback();
  const filters = useFleetFilters();
  const fleet = useFleetOptions();
  const canManage = session.hasRole(FLEET_MANAGER_ROLES);

  const refillsQuery = useFuelRefills(filters.params);
  const updateFuelRefill = useUpdateFuelRefill();
  const deleteFuelRefill = useDeleteFuelRefill();

  const [editing, setEditing] = useState<FuelRefill | null>(null);
  const [deleting, setDeleting] = useState<FuelRefill | null>(null);

  const handleUpdate = async (input: FuelRefillInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateFuelRefill.mutateAsync({ id: editing.id, input }),
      {
        success: "Abastecimento atualizado com sucesso.",
        error: "Erro ao atualizar abastecimento. Tente novamente.",
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteFuelRefill.mutateAsync(deleting.id),
      {
        success: "Abastecimento deletado com sucesso.",
        error: "Erro ao deletar abastecimento. Tente novamente.",
      },
    );
    if (succeeded) setDeleting(null);
  };

  return (
    <Box>
      <SectionHeader
        icon={LocalGasStationIcon}
        title="Histórico de abastecimentos"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.registerFuelRefill)}
            sx={{
              textTransform: "none",
              bgcolor: COLORS.brand,
              "&:hover": { bgcolor: COLORS.brandHover },
            }}
          >
            Lançar abastecimento
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

      <FuelRefillTable
        refills={refillsQuery.data ?? []}
        loading={refillsQuery.isPending}
        error={
          refillsQuery.isError
            ? "Erro ao carregar o histórico de abastecimentos."
            : null
        }
        emptyMessage={
          filters.hasFilters
            ? "Nenhum abastecimento encontrado para os filtros selecionados."
            : "Nenhum abastecimento lançado."
        }
        canManage={canManage}
        busyId={getBusyRowId(updateFuelRefill, deleteFuelRefill)}
        vehicleLabelOf={fleet.vehicleLabelOf}
        deliverymanLabelOf={fleet.deliverymanLabelOf}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <FuelRefillEditDialog
        refill={editing}
        vehicleOptions={fleet.vehicleOptions}
        deliverymanOptions={fleet.deliverymanOptions}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar este abastecimento? O km rodado e o consumo do abastecimento seguinte serão recalculados."
        loading={deleteFuelRefill.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default FuelRefillsPage;
