import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import api from "../../services/api";

interface DataItem {
  name: string;
  value: number;
}

interface OrderData {
  id: number;
  quantity: string;
  amount: number;
  data: string;
  status: "actived" | "delivered" | "finished";
  Register: {
    client: {
      name: string;
      lastName: string;
      phone: string;
    };
    address: {
      street: string;
      neighborhood: string;
      numberHouse: number;
      reference: string;
      city: string;
    };
  };
}

const COLORS = [
  "#4361EE",
  "#17D6A3",
  "#FFC107",
  "#FF6B6B",
  "#6C5CE7",
  "#07A7DF",
  "#A0A0A0",
];

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (
    percent == null ||
    percent === 0 ||
    midAngle == null ||
    cx == null ||
    cy == null ||
    innerRadius == null ||
    outerRadius == null
  ) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

interface DonutChartProps {
  data: DataItem[];
  height?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, height = 300 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length) {
    return (
      <Box
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        Nenhum dado disponível
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `${value as number} (${total > 0 ? (((value as number) / total) * 100).toFixed(1) : 0}%)`,
            "Entregas",
          ] as [string, string]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RelatoriosDashboard = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    api
      .get<OrderData[]>("/orderDelivery")
      .then((res) => {
        if (!active) return;
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setError("Erro ao carregar os relatórios de entregas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const bairros: DataItem[] = useMemo(() => {
    const totals = new Map<string, number>();

    orders.forEach((order) => {
      const label = order.Register?.address?.neighborhood?.trim();
      if (!label) return;
      totals.set(label, (totals.get(label) ?? 0) + 1);
    });

    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [orders]);

  const cidades: DataItem[] = useMemo(() => {
    const totals = new Map<string, number>();

    orders.forEach((order) => {
      const label = order.Register?.address?.city?.trim();
      if (!label) return;
      totals.set(label, (totals.get(label) ?? 0) + 1);
    });

    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [orders]);

  const totalBairros = useMemo(
    () => bairros.reduce((s, i) => s + i.value, 0),
    [bairros],
  );

  const totalCidades = useMemo(
    () => cidades.reduce((s, i) => s + i.value, 0),
    [cidades],
  );

  const totalPedidos = orders.length;
  const pedidosFinalizados = orders.filter((order) => order.status === "finished").length;
  const pedidosPendentes = Math.max(totalPedidos - pedidosFinalizados, 0);

  const overallData: DataItem[] = [
    { name: "Finalizadas", value: pedidosFinalizados },
    { name: "Pendentes", value: pedidosPendentes },
  ];

  const statCards = [
    { label: "Bairros atendidos", value: bairros.length, description: "Cobertura geográfica consolidada", icon: <LocationOnOutlinedIcon fontSize="small" /> },
    { label: "Cidades atendidas", value: cidades.length, description: "Distribuição por município", icon: <PublicOutlinedIcon fontSize="small" /> },
    { label: "Entregas", value: totalPedidos, description: "Volume total registrado", icon: <AssignmentTurnedInOutlinedIcon fontSize="small" /> },
    { label: "Finalizadas", value: pedidosFinalizados, description: "Pedidos concluídos com sucesso", icon: <PendingActionsOutlinedIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: "grid", gap: 3, mr:40 }}>
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

      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="55%" />
                  <Skeleton variant="rounded" height={42} sx={{ my: 2 }} />
                  <Skeleton variant="text" width="75%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: 340 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="circular" width={220} height={220} sx={{ mx: "auto", my: 3 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: 340 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="circular" width={220} height={220} sx={{ mx: "auto", my: 3 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: 340 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="circular" width={220} height={220} sx={{ mx: "auto", my: 3 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && totalPedidos === 0 ? (
        <EmptyState
          title="Nenhuma entrega encontrada"
          description="Não há registros suficientes para gerar relatórios neste momento."
          icon={<AssignmentTurnedInOutlinedIcon fontSize="large" />}
        />
      ) : null}

      {!loading && !error && totalPedidos > 0 ? (
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            {statCards.map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
                <StatCard {...item} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Por bairro
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total: <strong>{totalBairros}</strong> entregas
                  </Typography>
                  <DonutChart data={bairros} height={300} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Por cidade
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total: <strong>{totalCidades}</strong> entregas
                  </Typography>
                  <DonutChart data={cidades} height={300} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Situação geral
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Finalizadas vs. pendentes
                  </Typography>
                  <DonutChart data={overallData} height={300} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      ) : null}
    </Box>
  );
};

export default RelatoriosDashboard;
