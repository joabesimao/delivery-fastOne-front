import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { deliverymanFullName, useDeliverymen } from "@/features/deliverymen";
import { useClientPagination } from "@/shared/lib/hooks/useClientPagination";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import FormSectionTitle from "@/shared/ui/form/FormSectionTitle";
import {
  ALL,
  filterFinishableDeliveries,
  type FinishableDeliveryFilters,
} from "../../domain/deliveryFilters";
import type { FinishDeliveryInput } from "../../domain/finishDelivery";
import {
  useDeliveries,
  useFinishDelivery,
} from "../../application/deliveryQueries";
import { useDeliveryRealtimeSync } from "../../application/useDeliveryRealtimeSync";
import DeliverySummaryCards from "../components/DeliverySummaryCards";
import FinishDeliveryForm from "../components/FinishDeliveryForm";
import FinishableDeliveriesPanel from "../components/FinishableDeliveriesPanel";

const FinishDeliveryPage = () => {
  const locationState = useLocation().state as { orderId?: number } | null;
  const colors = useSurfaceColors();
  const runWithFeedback = useActionFeedback();
  const deliveriesQuery = useDeliveries();
  const deliverymen = useDeliverymen().data;
  const finishDelivery = useFinishDelivery();
  useDeliveryRealtimeSync();

  const [selectedId, setSelectedId] = useState<number | null>(
    () => locationState?.orderId ?? null,
  );
  const [filters, setFilters] = useState<FinishableDeliveryFilters>({
    search: "",
    status: ALL,
    deliverymanId: ALL,
  });

  const deliveries = useMemo(
    () => deliveriesQuery.data ?? [],
    [deliveriesQuery.data],
  );
  const filtered = useMemo(
    () => filterFinishableDeliveries(deliveries, filters),
    [deliveries, filters],
  );
  const { pageItems, paginationProps } = useClientPagination(filtered, {
    resetKey: JSON.stringify(filters),
  });
  const deliverymanOptions = useMemo(
    () =>
      (deliverymen ?? []).map((d) => ({
        value: String(d.id),
        label: deliverymanFullName(d),
      })),
    [deliverymen],
  );

  const selected = deliveries.find((d) => d.id === selectedId) ?? null;

  const handleFinish = async (input: FinishDeliveryInput) => {
    if (!selected) return false;
    const succeeded = await runWithFeedback(
      () => finishDelivery.mutateAsync({ id: selected.id, input }),
      {
        success: "Entrega finalizada com sucesso!",
        error: "Erro ao finalizar a entrega. Tente novamente.",
        showApiError: false,
      },
    );
    if (succeeded) setSelectedId(null);
    return succeeded;
  };

  if (selected) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 800,
          mx: "auto",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          mr: 40,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            mr: 40,
          }}
        >
          <IconButton size="small" onClick={() => setSelectedId(null)}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "text.primary" }}
          >
            Finalizar entrega
          </Typography>
          <Box sx={{ width: 32 }} />
        </Box>
        <Divider sx={{ mb: 4 }} />

        <FormSectionTitle title="Dados do pedido" />
        <DeliverySummaryCards delivery={selected} />

        <Divider sx={{ mb: 3 }} />
        <FormSectionTitle title="Confirmar dados da entrega" />
        <FinishDeliveryForm
          key={selected.id}
          delivery={selected}
          deliverymanOptions={deliverymanOptions}
          onSubmit={handleFinish}
          onCancel={() => setSelectedId(null)}
        />
      </Paper>
    );
  }

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
          Finalizar entrega
        </Typography>
      </Box>

      <FinishableDeliveriesPanel
        deliveries={pageItems}
        loading={deliveriesQuery.isPending}
        error={
          deliveriesQuery.isError
            ? "Erro ao carregar a lista de pedidos."
            : null
        }
        filters={filters}
        deliverymanOptions={deliverymanOptions}
        paginationProps={paginationProps}
        onFiltersChange={(changes) =>
          setFilters((current) => ({ ...current, ...changes }))
        }
        onSelect={(delivery) => setSelectedId(delivery.id)}
      />
    </Box>
  );
};

export default FinishDeliveryPage;
