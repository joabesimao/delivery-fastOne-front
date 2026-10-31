import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { ROUTES } from "@/shared/config/routes";
import { useClientPagination } from "@/shared/lib/hooks/useClientPagination";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import { useToast } from "@/shared/ui/feedback/useToast";
import {
  citiesOfClients,
  emptyClientFilters,
  filterClients,
  type Client,
  type ClientFilters,
  type ClientUpdateInput,
} from "../../domain/client";
import {
  useClients,
  useSetClientActive,
  useUpdateClient,
} from "../../application/clientQueries";
import ClientDetailsDialog from "../components/ClientDetailsDialog";
import ClientEditDialog from "../components/ClientEditDialog";
import ClientsPanel from "../components/ClientsPanel";

const ClientsPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state as { search?: string } | null;
  const colors = useSurfaceColors();
  const toast = useToast();
  const runWithFeedback = useActionFeedback();

  const clientsQuery = useClients();
  const updateClient = useUpdateClient();
  const setClientActive = useSetClientActive();

  const [filters, setFilters] = useState<ClientFilters>(() =>
    emptyClientFilters(locationState?.search ?? ""),
  );
  const [viewing, setViewing] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);

  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data]);
  const cities = useMemo(() => citiesOfClients(clients), [clients]);
  const filtered = useMemo(
    () => filterClients(clients, filters),
    [clients, filters],
  );
  const { pageItems, paginationProps } = useClientPagination(filtered, {
    initialRowsPerPage: 5,
    resetKey: JSON.stringify(filters),
  });

  const busyId =
    (setClientActive.isPending && setClientActive.variables?.id) ||
    (updateClient.isPending && updateClient.variables?.id) ||
    null;

  const handleUpdate = async (input: ClientUpdateInput) => {
    if (!editing) return false;
    const addressId = editing.address?.id;
    if (!addressId) {
      toast.error(
        "Não foi possível identificar o endereço do cliente para edição.",
      );
      return false;
    }
    const succeeded = await runWithFeedback(
      () => updateClient.mutateAsync({ id: editing.id, addressId, input }),
      {
        success: "Cliente atualizado com sucesso.",
        error: "Erro ao atualizar cliente. Tente novamente.",
      },
    );
    if (succeeded) setEditing(null);
    return succeeded;
  };

  const handleToggleActive = (client: Client) =>
    void runWithFeedback(
      () =>
        setClientActive.mutateAsync({ id: client.id, active: !client.active }),
      {
        success: client.active
          ? "Cliente inativado com sucesso."
          : "Cliente ativado com sucesso.",
        error: "Não foi possível alterar o status do cliente.",
        showApiError: false,
      },
    );

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
          Visualizar clientes cadastrados
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate(ROUTES.registerClient)}
          sx={{
            bgcolor: "#0ea5e9",
            "&:hover": { bgcolor: "#0284c7" },
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Cadastrar cliente
        </Button>
      </Box>

      <ClientsPanel
        clients={pageItems}
        total={filtered.length}
        cities={cities}
        loading={clientsQuery.isPending}
        error={
          clientsQuery.isError ? "Erro ao carregar a lista de clientes." : null
        }
        filters={filters}
        busyId={busyId}
        paginationProps={paginationProps}
        onFiltersChange={(changes) =>
          setFilters((current) => ({ ...current, ...changes }))
        }
        onView={setViewing}
        onEdit={setEditing}
        onToggleActive={handleToggleActive}
      />

      <ClientDetailsDialog client={viewing} onClose={() => setViewing(null)} />
      <ClientEditDialog
        client={editing}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />
    </Box>
  );
};

export default ClientsPage;
