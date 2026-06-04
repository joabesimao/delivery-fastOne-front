import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
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

const RelatoriosDashboard: React.FC = () => {
  const theme = useTheme();
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

  const cardSx = {
    height: "100%",
    borderRadius: 3,
    boxShadow: theme.shadows[2],
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Relatórios de Entregas
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Distribuição percentual das entregas por bairro, cidade e visão geral.
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && totalPedidos === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nenhuma entrega encontrada para gerar relatórios.
        </Alert>
      )}

      {/* ── Linha 1: cards de resumo numérico ── */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Bairros atendidos", value: bairros.length, icon: "🏘️" },
          { label: "Cidades atendidas", value: cidades.length, icon: "🏙️" },
          { label: "Entregas", value: totalPedidos, icon: "📦" },
          { label: "Finalizadas", value: pedidosFinalizados, icon: "🚚" },
        ].map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
            <Card
              sx={{
                ...cardSx,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: 13 }}>
                  {item.icon} {item.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} mt={0.5}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Linha 2: 3 gráficos de rosquinha ── */}
      <Grid container spacing={3}>
        {/* Por Bairro */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Por Bairro
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Total: <strong>{totalBairros}</strong> entregas
              </Typography>
              <DonutChart data={bairros} height={280} />
            </CardContent>
          </Card>
        </Grid>

        {/* Por Cidade */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Por Cidade
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Total: <strong>{totalCidades}</strong> entregas
              </Typography>
              <DonutChart data={cidades} height={280} />
            </CardContent>
          </Card>
        </Grid>

        {/* Geral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Porcentagem Geral
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Finalizadas vs. Pendentes
              </Typography>
              <DonutChart data={overallData} height={280} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RelatoriosDashboard;
