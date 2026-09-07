import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import WifiTetheringRoundedIcon from "@mui/icons-material/WifiTetheringRounded";

type Period = "hoje" | "7dias" | "30dias" | "personalizado";

type StatCardItem = {
  label: string;
  value: string;
  delta: string;
  deltaTone: "success" | "warning";
  hint: string;
  icon: ReactNode;
  color: string;
};

type OrderStatus = "transito" | "aguardando" | "entregue" | "cancelado";

type RealtimeOrder = {
  id: string;
  clientName: string;
  clientPhone: string;
  address: string;
  neighborhood: string;
  deliveryman: string | null;
  amount: number;
  status: OrderStatus;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  transito: { label: "Em Trânsito", color: "#0EA5E9", bg: alpha("#0EA5E9", 0.12) },
  aguardando: { label: "Aguardando aceite", color: "#F59E0B", bg: alpha("#F59E0B", 0.14) },
  entregue: { label: "Entregue", color: "#10B981", bg: alpha("#10B981", 0.14) },
  cancelado: { label: "Cancelado", color: "#EF4444", bg: alpha("#EF4444", 0.12) },
};

const weeklyPerformance = [
  { day: "Seg", realizado: 92, media: 85 },
  { day: "Ter", realizado: 105, media: 95 },
  { day: "Qua", realizado: 98, media: 90 },
  { day: "Qui (Hoje)", realizado: 138, media: 100, highlight: true },
  { day: "Sex", realizado: 154, media: 120, highlight: true },
  { day: "Sáb", realizado: 110, media: 90 },
  { day: "Dom", realizado: 60, media: 55 },
];

const topDeliverers = [
  { rank: 1, name: "Rodrigo Alves", deliveries: 84, meta: 96, vehicle: "Moto", medal: "#F59E0B" },
  { rank: 2, name: "Marcos Lima", deliveries: 76, meta: 88, vehicle: "Bike", medal: "#94A3B8" },
  { rank: 3, name: "Juliana Santos", deliveries: 69, meta: 79, vehicle: "Carro", medal: "#B45309" },
];

const realtimeOrders: RealtimeOrder[] = [
  {
    id: "#4825",
    clientName: "Lucas Peixoto",
    clientPhone: "(11) 98842-1102",
    address: "Av. Paulista, 1578 - Apto 62",
    neighborhood: "Bela Vista, São Paulo",
    deliveryman: "Rodrigo Alves",
    amount: 142.5,
    status: "transito",
  },
  {
    id: "#4824",
    clientName: "Mariana Albuquerque",
    clientPhone: "(11) 97120-9482",
    address: "Rua Oscar Freire, 920",
    neighborhood: "Cerqueira César, São Paulo",
    deliveryman: null,
    amount: 89.9,
    status: "aguardando",
  },
  {
    id: "#4823",
    clientName: "Fernando Moreira",
    clientPhone: "(11) 99234-1290",
    address: "Av. Farmacêutica, 450 - Bloco B",
    neighborhood: "Vila Bela, São Paulo",
    deliveryman: "Marcos Lima",
    amount: 25.0,
    status: "entregue",
  },
  {
    id: "#4822",
    clientName: "Carolina Diniz",
    clientPhone: "(11) 98123-4477",
    address: "Rua Pamplona, 1140",
    neighborhood: "Jardim Paulista, São Paulo",
    deliveryman: "Não atribuído",
    amount: 64.0,
    status: "cancelado",
  },
  {
    id: "#4821",
    clientName: "Rafael Guimarães",
    clientPhone: "(11) 96543-2201",
    address: "Av. Brigadeiro Faria Lima, 3477",
    neighborhood: "Itaim Bibi, São Paulo",
    deliveryman: "Juliana Santos",
    amount: 178.0,
    status: "entregue",
  },
];

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "30dias", label: "30 dias" },
  { value: "personalizado", label: "Personalizado" },
];

const StatCard = ({ item }: { item: StatCardItem }) => (
  <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
    <Stack spacing={1.25} sx={{ p: 2.25 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
          {item.label}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(item.color, 0.14),
            color: item.color,
          }}
        >
          {item.icon}
        </Box>
      </Stack>

      <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 26, md: 30 }, lineHeight: 1 }}>
        {item.value}
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center">
        <Chip
          label={item.delta}
          size="small"
          color={item.deltaTone}
          variant="filled"
          sx={{ height: 20, fontSize: 11, fontWeight: 800, "& .MuiChip-label": { px: 0.9 } }}
        />
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.hint}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

const DashboardIndex = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("hoje");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");

  const statCards = useMemo(
    (): StatCardItem[] => [
      {
        label: "Entregas em andamento",
        value: "34",
        delta: "+12%",
        deltaTone: "success",
        hint: "vs. ontem",
        icon: <Inventory2RoundedIcon fontSize="small" />,
        color: "#0EA5E9",
      },
      {
        label: "Receita entregue",
        value: currencyFormatter.format(14850),
        delta: "+8,4%",
        deltaTone: "success",
        hint: "no período",
        icon: <MonetizationOnOutlinedIcon fontSize="small" />,
        color: "#10B981",
      },
      {
        label: "Clientes online",
        value: "1.280",
        delta: "+5%",
        deltaTone: "success",
        hint: "novos este mês",
        icon: <GroupOutlinedIcon fontSize="small" />,
        color: "#8B5CF6",
      },
      {
        label: "Entregadores online",
        value: "28/35",
        delta: "80%",
        deltaTone: "warning",
        hint: "disponível",
        icon: <TwoWheelerOutlinedIcon fontSize="small" />,
        color: "#F59E0B",
      },
      {
        label: "Cidades atendidas",
        value: "4",
        delta: "ativo",
        deltaTone: "success",
        hint: "SP, Guarulhos, ABC",
        icon: <LocationCityOutlinedIcon fontSize="small" />,
        color: "#0891B2",
      },
      {
        label: "Bairros atendidos",
        value: "42",
        delta: "+2",
        deltaTone: "success",
        hint: "mapeados",
        icon: <MapOutlinedIcon fontSize="small" />,
        color: "#4F46E5",
      },
    ],
    [],
  );

  const maxVolume = Math.max(...weeklyPerformance.map((d) => Math.max(d.realizado, d.media)));

  const filteredOrders =
    statusFilter === "todos" ? realtimeOrders : realtimeOrders.filter((order) => order.status === statusFilter);

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        gap={1.5}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Olá, Carlos (Operador)
            </Typography>
            <Chip
              label="Turno Ativo"
              color="success"
              size="small"
              sx={{ fontWeight: 700, "& .MuiChip-label": { px: 1.2 } }}
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <CalendarTodayRoundedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Quinta-feira, 24 de Outubro de 2024
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <WifiTetheringRoundedIcon sx={{ fontSize: 15, color: "success.main" }} />
              <Typography variant="body2" color="text.secondary">
                Sincronização em tempo real ativa (Latência 12ms)
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={period}
            onChange={(_, value) => value && setPeriod(value)}
            sx={{
              bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
              borderRadius: 999,
              p: 0.4,
              "& .MuiToggleButtonGroup-grouped": {
                border: 0,
                borderRadius: "999px !important",
                px: 1.5,
                fontWeight: 700,
                fontSize: 12.5,
                textTransform: "none",
              },
            }}
          >
            {periodOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/listagem-entregas", { state: { openCreate: true } })}
            sx={{ borderRadius: 999, px: 2.5, whiteSpace: "nowrap" }}
          >
            Novo Pedido
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {statCards.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <StatCard item={item} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
            <Stack spacing={2} sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Desempenho de Entregas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Volume semanal da Matriz Central com comparação de horários de pico
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Stack alignItems="center" spacing={0.25}>
                    <Stack direction="row" spacing={0.4} alignItems="center">
                      <ScheduleRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Média Tempo
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      32 min
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.25}>
                    <Stack direction="row" spacing={0.4} alignItems="center">
                      <BoltRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Pico
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Sexta-feira
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.25}>
                    <Stack direction="row" spacing={0.4} alignItems="center">
                      <Inventory2RoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      154 entregas
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={{ xs: 1.5, sm: 3 }} alignItems="flex-end" sx={{ height: 220, px: 1 }}>
                {weeklyPerformance.map((item) => (
                  <Stack key={item.day} spacing={0.75} alignItems="center" sx={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
                    {item.highlight ? (
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {item.realizado}
                      </Typography>
                    ) : null}
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 34,
                        borderRadius: "8px 8px 0 0",
                        height: `${(item.realizado / maxVolume) * 100}%`,
                        bgcolor: item.highlight ? "primary.main" : alpha("#0EA5E9", 0.28),
                        transition: "height 240ms ease",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: item.highlight ? "primary.main" : "text.secondary", fontWeight: item.highlight ? 800 : 600 }}
                      noWrap
                    >
                      {item.day}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1}
                sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}
              >
                <Stack direction="row" spacing={2.5}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main" }} />
                    <Typography variant="caption" color="text.secondary">
                      Volume Realizado
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: alpha("#0EA5E9", 0.28) }} />
                    <Typography variant="caption" color="text.secondary">
                      Média Histórica
                    </Typography>
                  </Stack>
                </Stack>

                <Chip
                  label="Taxa de pontualidade: 98,2% na semana"
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: "100%" }}>
            <Stack spacing={1.75} sx={{ p: 2.5, height: "100%" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Top Entregadores
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ranking semanal · 50 entregas
                </Typography>
              </Box>

              <Stack spacing={1.25} sx={{ flex: 1 }}>
                {topDeliverers.map((deliverer) => (
                  <Stack
                    key={deliverer.rank}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{ p: 1.25, borderRadius: 2.5, border: 1, borderColor: "divider" }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#fff",
                        bgcolor: deliverer.medal,
                        flexShrink: 0,
                      }}
                    >
                      {deliverer.rank}
                    </Box>

                    <Avatar sx={{ width: 38, height: 38, bgcolor: "secondary.main", fontSize: 13 }}>
                      {deliverer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {deliverer.name}
                      </Typography>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <DirectionsBikeRoundedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {deliverer.vehicle} · Meta {deliverer.meta}%
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {deliverer.deliveries}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        entregas
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Button
                fullWidth
                onClick={() => navigate("/relatorios-entregas/entregadores")}
                sx={{ fontWeight: 700, justifyContent: "space-between" }}
                endIcon={<AddRoundedIcon sx={{ transform: "rotate(45deg)" }} fontSize="small" />}
              >
                Ver classificação completa da frota
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Últimas Entregas em Tempo Real
                </Typography>
                <Chip
                  icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main" }} />}
                  label="Live Feed"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Monitoramento de despachos e status com rastreamento GPS instantâneo
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Select
                size="small"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "todos")}
                sx={{ minWidth: 168, borderRadius: 999 }}
              >
                <MenuItem value="todos">Todos os Status</MenuItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <MenuItem key={value} value={value}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
              <Tooltip title="Atualizar">
                <IconButton>
                  <RefreshRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>ID Pedido</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Destino e bairro</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Entregador responsável</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Valor</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{order.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                          {order.clientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {order.clientPhone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {order.address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {order.neighborhood}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.deliveryman ? (
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "secondary.main" }}>
                              {order.deliveryman.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" noWrap>
                              {order.deliveryman}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            Não atribuído
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{currencyFormatter.format(order.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Conversar">
                          <IconButton size="small">
                            <ChatBubbleOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver detalhes">
                          <IconButton size="small">
                            <RemoveRedEyeOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mais opções">
                          <IconButton size="small">
                            <MoreVertRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Mostrando 1 a {filteredOrders.length} de 89 pedidos em andamento
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {[1, 2, 3].map((page) => (
                <Chip
                  key={page}
                  label={page}
                  size="small"
                  color={page === 1 ? "primary" : "default"}
                  variant={page === 1 ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, minWidth: 30 }}
                />
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", px: 0.5 }}>
                …
              </Typography>
              <Chip label={9} size="small" variant="outlined" sx={{ fontWeight: 700, minWidth: 30 }} />
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default DashboardIndex;
