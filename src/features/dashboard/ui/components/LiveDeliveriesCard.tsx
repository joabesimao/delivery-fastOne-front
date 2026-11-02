import {
  Avatar,
  Box,
  Card,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { deliveryDeliverymanName, type Delivery } from "@/features/deliveries";
import { formatCurrency } from "@/shared/lib/format/currency";
import {
  LIVE_FEED_PAGE_SIZE,
  type DeliveryStatusFilter,
} from "../../domain/dashboardMetrics";
import { LIVE_STATUS } from "./liveDeliveryStatus";

interface LiveDeliveriesCardProps {
  deliveries: Delivery[];
  total: number;
  page: number;
  loading: boolean;
  status: DeliveryStatusFilter;
  onStatusChange: (status: DeliveryStatusFilter) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onChat: () => void;
  onViewDetails: () => void;
}

const COLUMNS = [
  "ID Pedido",
  "Cliente",
  "Destino e bairro",
  "Entregador responsável",
  "Valor",
  "Status",
];

const DeliveryRow = ({
  delivery,
  onChat,
  onViewDetails,
}: {
  delivery: Delivery;
  onChat: () => void;
  onViewDetails: () => void;
}) => {
  const status = LIVE_STATUS[delivery.status];
  const deliverymanName = delivery.deliveryman
    ? deliveryDeliverymanName(delivery.deliveryman)
    : null;
  const { address, client } = delivery;

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 700 }}>#{delivery.id}</TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
          {client.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {client.phone}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap>
          {address.street}, {address.numberHouse}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {address.neighborhood}, {address.city}
        </Typography>
      </TableCell>
      <TableCell>
        {deliverymanName ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: 11,
                bgcolor: "secondary.main",
              }}
            >
              {deliverymanName.charAt(0)}
            </Avatar>
            <Typography variant="body2" noWrap>
              {deliverymanName}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.disabled">
            Não atribuído
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ fontWeight: 700 }}>
        {formatCurrency(delivery.amount)}
      </TableCell>
      <TableCell>
        <Chip
          label={status.label}
          size="small"
          sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700 }}
        />
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Conversar">
          <IconButton size="small" onClick={onChat}>
            <ChatBubbleOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver detalhes">
          <IconButton size="small" onClick={onViewDetails}>
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
};

const LiveDeliveriesCard = ({
  deliveries,
  total,
  page,
  loading,
  status,
  onStatusChange,
  onPageChange,
  onRefresh,
  onChat,
  onViewDetails,
}: LiveDeliveriesCardProps) => {
  const pageCount = Math.max(1, Math.ceil(total / LIVE_FEED_PAGE_SIZE));
  const firstShown =
    deliveries.length === 0 ? 0 : (page - 1) * LIVE_FEED_PAGE_SIZE + 1;
  const lastShown = Math.min(page * LIVE_FEED_PAGE_SIZE, total);

  return (
    <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
      <Stack spacing={2} sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1.5}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Últimas Entregas em Tempo Real
              </Typography>
              <Chip
                icon={
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                    }}
                  />
                }
                label="Live Feed"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Todos os pedidos cadastrados, com status e entregador responsável
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Select
              size="small"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as DeliveryStatusFilter)
              }
              sx={{ minWidth: 168, borderRadius: 999 }}
            >
              <MenuItem value="all">Todos os Status</MenuItem>
              {Object.entries(LIVE_STATUS).map(([value, config]) => (
                <MenuItem key={value} value={value}>
                  {config.label}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title="Atualizar">
              <IconButton onClick={onRefresh}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 800 }}>
                    {column}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 800 }} align="right">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: LIVE_FEED_PAGE_SIZE }).map(
                    (_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: COLUMNS.length + 1 }).map(
                          (__, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" />
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ),
                  )
                : deliveries.map((delivery) => (
                    <DeliveryRow
                      key={delivery.id}
                      delivery={delivery}
                      onChat={onChat}
                      onViewDetails={onViewDetails}
                    />
                  ))}

              {!loading && deliveries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2, textAlign: "center" }}
                    >
                      Nenhum pedido encontrado para o filtro selecionado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <Typography variant="caption" color="text.secondary">
            Mostrando {firstShown} a {lastShown} de {total} pedidos
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {Array.from({ length: pageCount }).map((_, index) => {
              const pageNumber = index + 1;
              const selected = pageNumber === page;
              return (
                <Chip
                  key={pageNumber}
                  label={pageNumber}
                  size="small"
                  onClick={() => onPageChange(pageNumber)}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, minWidth: 30, cursor: "pointer" }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default LiveDeliveriesCard;
