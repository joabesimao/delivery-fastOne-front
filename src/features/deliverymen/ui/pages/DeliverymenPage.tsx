import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { ROUTES } from "@/shared/config/routes";
import { useClientPagination } from "@/shared/lib/hooks/useClientPagination";
import { getBusyRowId } from "@/shared/lib/query/createCrudQueries";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import {
  collectRegisteredDocuments,
  filterDeliverymen,
  type Deliveryman,
  type DeliverymanFilters,
  type DeliverymanInput,
} from "../../domain/deliveryman";
import {
  useDeleteDeliveryman,
  useDeliverymen,
  useUpdateDeliveryman,
} from "../../application/deliverymanQueries";
import DeliverymanDetailsDialog from "../components/DeliverymanDetailsDialog";
import DeliverymanEditDialog from "../components/DeliverymanEditDialog";
import DeliverymenPanel from "../components/DeliverymenPanel";

import { COLORS } from "@/shared/theme/colors";
const DeliverymenPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state as { search?: string } | null;
  const colors = useSurfaceColors();
  const runWithFeedback = useActionFeedback();

  const deliverymenQuery = useDeliverymen();
  const updateDeliveryman = useUpdateDeliveryman();
  const deleteDeliveryman = useDeleteDeliveryman();

  const [filters, setFilters] = useState<DeliverymanFilters>(() => ({
    name: locationState?.search ?? "",
    phone: "",
  }));
  const [viewing, setViewing] = useState<Deliveryman | null>(null);
  const [editing, setEditing] = useState<Deliveryman | null>(null);
  const [deleting, setDeleting] = useState<Deliveryman | null>(null);

  const deliverymen = useMemo(
    () => deliverymenQuery.data ?? [],
    [deliverymenQuery.data],
  );
  const filtered = useMemo(
    () => filterDeliverymen(deliverymen, filters),
    [deliverymen, filters],
  );
  const { pageItems, paginationProps } = useClientPagination(filtered, {
    initialRowsPerPage: 5,
    resetKey: JSON.stringify(filters),
  });
  const registeredDocuments = useMemo(
    () => collectRegisteredDocuments(deliverymen, editing?.id),
    [deliverymen, editing?.id],
  );

  const handleUpdate = async (input: DeliverymanInput) => {
    if (!editing) return false;
    const succeeded = await runWithFeedback(
      () => updateDeliveryman.mutateAsync({ id: editing.id, input }),
      {
        success: "Entregador atualizado com sucesso.",
        error: "Erro ao atualizar entregador. Tente novamente.",
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteDeliveryman.mutateAsync(deleting.id),
      {
        success: "Entregador deletado com sucesso.",
        error: "Erro ao deletar entregador. Tente novamente.",
        showApiError: false,
      },
    );
    if (succeeded) setDeleting(null);
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: colors.textPrimary }}
        >
          Gerenciar entregadores
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate(ROUTES.registerDeliveryman)}
          sx={{
            bgcolor: COLORS.info,
            "&:hover": { bgcolor: COLORS.infoHover },
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Cadastrar entregador
        </Button>
      </Box>

      <DeliverymenPanel
        deliverymen={pageItems}
        total={filtered.length}
        loading={deliverymenQuery.isPending}
        error={
          deliverymenQuery.isError
            ? "Erro ao carregar a lista de entregadores."
            : null
        }
        filters={filters}
        busyId={getBusyRowId(updateDeliveryman, deleteDeliveryman)}
        paginationProps={paginationProps}
        onFiltersChange={(changes) =>
          setFilters((current) => ({ ...current, ...changes }))
        }
        onView={setViewing}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <DeliverymanDetailsDialog
        deliveryman={viewing}
        onClose={() => setViewing(null)}
      />

      <DeliverymanEditDialog
        deliveryman={editing}
        registeredDocuments={registeredDocuments}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar este entregador? Esta ação é irreversível."
        loading={deleteDeliveryman.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

export default DeliverymenPage;
