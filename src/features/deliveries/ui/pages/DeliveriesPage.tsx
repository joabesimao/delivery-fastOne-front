import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { ROUTES } from "@/shared/config/routes";
import { useClientPagination } from "@/shared/lib/hooks/useClientPagination";
import type { Delivery } from "../../domain/delivery";
import {
  ALL,
  citiesOfDeliveries,
  countActiveDeliveries,
  deliverymenOfDeliveries,
  filterDeliveries,
  neighborhoodsOfDeliveries,
  type DeliveryListFilters as Filters,
} from "../../domain/deliveryFilters";
import type { PreloadedDeliveryClient } from "../../domain/deliveryOrder";
import { useDeliveries } from "../../application/deliveryQueries";
import { useDeliveryRealtimeSync } from "../../application/useDeliveryRealtimeSync";
import DeliveriesTable from "../components/DeliveriesTable";
import DeliveryCountCards from "../components/DeliveryCountCards";
import DeliveryDetailsDialog from "../components/DeliveryDetailsDialog";
import DeliveryListFilters from "../components/DeliveryListFilters";
import NewOrderDrawer from "../components/NewOrderDrawer";

interface DeliveriesLocationState {
  search?: string;
  openCreate?: boolean;
  clientData?: PreloadedDeliveryClient;
}

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state as DeliveriesLocationState | null;
  const deliveriesQuery = useDeliveries();
  useDeliveryRealtimeSync();

  const [filters, setFilters] = useState<Filters>(() => ({
    search: locationState?.search ?? "",
    progress: ALL,
    deliverymanId: ALL,
    city: ALL,
    neighborhood: ALL,
  }));
  const [createOpen, setCreateOpen] = useState(() =>
    Boolean(locationState?.openCreate),
  );
  const [preloadedClient, setPreloadedClient] =
    useState<PreloadedDeliveryClient | null>(() =>
      locationState?.openCreate ? (locationState.clientData ?? null) : null,
    );
  const [detailId, setDetailId] = useState<number | null>(null);

  const deliveries = useMemo(
    () => deliveriesQuery.data ?? [],
    [deliveriesQuery.data],
  );
  const loading = deliveriesQuery.isPending;

  const filtered = useMemo(
    () => filterDeliveries(deliveries, filters),
    [deliveries, filters],
  );
  const deliverymen = useMemo(
    () => deliverymenOfDeliveries(deliveries),
    [deliveries],
  );
  const cities = useMemo(() => citiesOfDeliveries(deliveries), [deliveries]);
  const neighborhoods = useMemo(
    () => neighborhoodsOfDeliveries(deliveries, filters.city),
    [deliveries, filters.city],
  );
  const activeCount = countActiveDeliveries(deliveries);

  const { pageItems, paginationProps } = useClientPagination(filtered, {
    resetKey: JSON.stringify(filters),
  });

  const detailDelivery = deliveries.find((d) => d.id === detailId) ?? null;

  const changeFilters = (changes: Partial<Filters>) =>
    setFilters((current) => {
      const next = { ...current, ...changes };
      if (
        changes.city &&
        changes.city !== ALL &&
        !neighborhoodsOfDeliveries(deliveries, changes.city).includes(
          next.neighborhood,
        )
      ) {
        next.neighborhood = ALL;
      }
      return next;
    });

  const goToFinish = (delivery: Delivery) =>
    navigate(ROUTES.finishDelivery, { state: { orderId: delivery.id } });

  const closeDrawer = () => {
    setCreateOpen(false);
    setPreloadedClient(null);
  };

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pedidos de Entrega
            </Typography>
            <Chip
              label={loading ? "..." : deliveries.length}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, "& .MuiChip-label": { px: 1.1 } }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Gerencie e acompanhe todos os pedidos ativos e finalizados
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 999, px: 2.5, whiteSpace: "nowrap" }}
        >
          Novo Pedido
        </Button>
      </Stack>

      <DeliveryCountCards
        loading={loading}
        total={deliveries.length}
        active={activeCount}
      />

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <DeliveryListFilters
            filters={filters}
            loading={loading}
            counts={{
              all: deliveries.length,
              active: activeCount,
              finished: deliveries.length - activeCount,
            }}
            deliverymen={deliverymen}
            cities={cities}
            neighborhoods={neighborhoods}
            onChange={changeFilters}
          />

          {deliveriesQuery.isError && (
            <Alert severity="error">Erro ao carregar as entregas.</Alert>
          )}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <DeliveriesTable
              deliveries={pageItems}
              paginationProps={paginationProps}
              onOpen={(delivery) => setDetailId(delivery.id)}
              onFinish={goToFinish}
            />
          )}
        </Stack>
      </Card>

      <DeliveryDetailsDialog
        delivery={detailDelivery}
        onClose={() => setDetailId(null)}
        onFinish={goToFinish}
      />

      <NewOrderDrawer
        open={createOpen}
        preloadedClient={preloadedClient}
        onClose={closeDrawer}
      />
    </Stack>
  );
};

export default DeliveriesPage;
