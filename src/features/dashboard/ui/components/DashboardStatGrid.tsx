import { Grid } from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import { formatCurrency } from "@/shared/lib/format/currency";
import {
  revenueDelta,
  type DashboardMetrics,
} from "../../domain/dashboardMetrics";
import DashboardStatCard, { type DashboardStatItem } from "./DashboardStatCard";

interface DashboardStatGridProps {
  metrics: DashboardMetrics | undefined;
  loading: boolean;
}

const countOf = (value: number | undefined) =>
  value === undefined ? "—" : String(value);

const DashboardStatGrid = ({ metrics, loading }: DashboardStatGridProps) => {
  const delta = revenueDelta(metrics);
  const items: DashboardStatItem[] = [
    {
      label: "Entregas em andamento",
      value: countOf(metrics?.activeDeliveries),
      hint: "no período selecionado",
      icon: <Inventory2RoundedIcon fontSize="small" />,
      color: "#0EA5E9",
    },
    {
      label: "Receita entregue",
      value: metrics ? formatCurrency(metrics.deliveredRevenue) : "—",
      delta: delta ?? undefined,
      deltaTone: delta?.startsWith("-") ? "warning" : "success",
      hint: "no período",
      icon: <MonetizationOnOutlinedIcon fontSize="small" />,
      color: "#10B981",
    },
    {
      label: "Total de Clientes",
      value: countOf(metrics?.clients),
      hint: "cadastrados no sistema",
      icon: <GroupOutlinedIcon fontSize="small" />,
      color: "#8B5CF6",
    },
    {
      label: "Entregadores Cadastrados",
      value: countOf(metrics?.deliverymen),
      hint: "na frota",
      icon: <TwoWheelerOutlinedIcon fontSize="small" />,
      color: "#F59E0B",
    },
    {
      label: "Cidades atendidas",
      value: countOf(metrics?.cities),
      hint: "cadastradas",
      icon: <LocationCityOutlinedIcon fontSize="small" />,
      color: "#0891B2",
    },
    {
      label: "Bairros atendidos",
      value: countOf(metrics?.neighborhoods),
      hint: "mapeados",
      icon: <MapOutlinedIcon fontSize="small" />,
      color: "#4F46E5",
    },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <DashboardStatCard item={item} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStatGrid;
