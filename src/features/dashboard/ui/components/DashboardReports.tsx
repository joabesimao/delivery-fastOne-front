import { useMemo } from "react";
import { Alert, Box, Button, Grid, Stack } from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { useDeliveries } from "@/features/deliveries";
import EmptyState from "@/shared/ui/EmptyState";
import PageHeader from "@/shared/ui/PageHeader";
import StatCard from "@/shared/ui/StatCard";
import {
  sumValues,
  summarizeDistribution,
} from "../../domain/deliveryDistribution";
import DistributionCard from "./DistributionCard";
import ReportsSkeleton from "./ReportsSkeleton";

const DashboardReports = () => {
  const deliveriesQuery = useDeliveries();
  const summary = useMemo(
    () => summarizeDistribution(deliveriesQuery.data ?? []),
    [deliveriesQuery.data],
  );
  const loading = deliveriesQuery.isPending;
  const failed = deliveriesQuery.isError;
  const ready = !loading && !failed;

  const statCards = [
    {
      label: "Bairros atendidos",
      value: summary.neighborhoods.length,
      description: "Cobertura geográfica consolidada",
      icon: <LocationOnOutlinedIcon fontSize="small" />,
    },
    {
      label: "Cidades atendidas",
      value: summary.cities.length,
      description: "Distribuição por município",
      icon: <PublicOutlinedIcon fontSize="small" />,
    },
    {
      label: "Entregas",
      value: summary.total,
      description: "Volume total registrado",
      icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
    },
    {
      label: "Finalizadas",
      value: summary.finished,
      description: "Pedidos concluídos com sucesso",
      icon: <PendingActionsOutlinedIcon fontSize="small" />,
    },
  ];

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <PageHeader
        eyebrow="Analíticos"
        title="Relatórios de entregas"
        description="Distribuição percentual das entregas por bairro, cidade e situação geral em uma visualização moderna."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
          </Stack>
        }
        icon={<AssignmentTurnedInOutlinedIcon />}
      />

      {loading && <ReportsSkeleton />}

      {failed && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar os relatórios de entregas.
        </Alert>
      )}

      {ready && summary.total === 0 && (
        <EmptyState
          title="Nenhuma entrega encontrada"
          description="Não há registros suficientes para gerar relatórios neste momento."
          icon={<AssignmentTurnedInOutlinedIcon fontSize="large" />}
        />
      )}

      {ready && summary.total > 0 && (
        <Stack spacing={2.5}>
          <Grid container spacing={2.5}>
            {statCards.map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
                <StatCard {...item} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <DistributionCard
                title="Por bairro"
                subtitle={
                  <>
                    Total: <strong>{sumValues(summary.neighborhoods)}</strong>{" "}
                    entregas
                  </>
                }
                data={summary.neighborhoods}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <DistributionCard
                title="Por cidade"
                subtitle={
                  <>
                    Total: <strong>{sumValues(summary.cities)}</strong> entregas
                  </>
                }
                data={summary.cities}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <DistributionCard
                title="Situação geral"
                subtitle="Finalizadas vs. pendentes"
                data={summary.overall}
              />
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  );
};

export default DashboardReports;
