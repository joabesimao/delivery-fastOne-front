import type { ComponentProps } from "react";
import {
  Avatar,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { formatDateTime } from "@/shared/lib/date/formatDate";
import { formatCurrency } from "@/shared/lib/format/currency";
import {
  deliveryStreetLine,
  isFinishedDelivery,
  type Delivery,
  type DeliveryDeliveryman,
} from "../../domain/delivery";
import DeliveryStatusChip from "./DeliveryStatusChip";

interface DeliveriesTableProps {
  deliveries: Delivery[];
  paginationProps: Omit<
    ComponentProps<typeof TablePagination>,
    "component" | "rowsPerPageOptions"
  >;
  onOpen: (delivery: Delivery) => void;
  onFinish: (delivery: Delivery) => void;
}

const COLUMNS = [
  "ID",
  "Cliente",
  "Destino e bairro",
  "Entregador",
  "Valor",
  "Recebido em",
  "Status",
];

const initials = ({ name, lastName }: DeliveryDeliveryman) =>
  `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const DeliveriesTable = ({
  deliveries,
  paginationProps,
  onOpen,
  onFinish,
}: DeliveriesTableProps) => (
  <>
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 900 }}>
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
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length + 1}
                align="center"
                sx={{ py: 5 }}
              >
                Nenhuma entrega encontrada para os filtros selecionados.
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((delivery) => (
              <TableRow
                key={delivery.id}
                hover
                onClick={() => onOpen(delivery)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ fontWeight: 700 }}>#{delivery.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                    {delivery.client.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {deliveryStreetLine(delivery.address)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {delivery.address.neighborhood} - {delivery.address.city}
                  </Typography>
                </TableCell>
                <TableCell>
                  {delivery.deliveryman ? (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 11,
                          bgcolor: "secondary.main",
                        }}
                      >
                        {initials(delivery.deliveryman)}
                      </Avatar>
                      <Typography variant="body2" noWrap>
                        {delivery.deliveryman.name}{" "}
                        {delivery.deliveryman.lastName}
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
                  {formatDateTime(delivery.receivedAt ?? delivery.createdAt)}
                </TableCell>
                <TableCell>
                  <DeliveryStatusChip status={delivery.status} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Ver detalhes">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(delivery);
                      }}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {!isFinishedDelivery(delivery) && (
                    <Tooltip title="Finalizar entrega">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(event) => {
                          event.stopPropagation();
                          onFinish(delivery);
                        }}
                      >
                        <CheckCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <TablePagination
      component="div"
      {...paginationProps}
      rowsPerPageOptions={[10, 25, 50]}
      labelRowsPerPage="Linhas por página"
      labelDisplayedRows={({ from, to, count }) =>
        `Mostrando ${from} a ${to} de ${count} pedidos`
      }
    />
  </>
);

export default DeliveriesTable;
