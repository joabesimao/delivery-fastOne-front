import type { ComponentProps } from "react";
import {
  FormControl,
  MenuItem,
  Select,
  TablePagination,
  Typography,
} from "@mui/material";
import type { SelectOption } from "@/shared/ui/form/FormSelectField";
import SearchField from "@/shared/ui/form/SearchField";
import type { DataTableColumn } from "@/shared/ui/data-table/DataTable";
import SurfaceFilter from "@/shared/ui/data-table/SurfaceFilter";
import SurfacePanel from "@/shared/ui/data-table/SurfacePanel";
import SurfaceTable from "@/shared/ui/data-table/SurfaceTable";
import { formatCurrency } from "@/shared/lib/format/currency";
import { phoneMask } from "@/shared/lib/masks";
import {
  useSurfaceColors,
  useSurfaceInputSx,
} from "@/shared/theme/useSurfaceColors";
import {
  deliveryStreetLine,
  isFinishedDelivery,
  type Delivery,
} from "../../domain/delivery";
import {
  ALL,
  type FinishableDeliveryFilters,
} from "../../domain/deliveryFilters";
import FinishStatusChip from "./FinishStatusChip";
import { FINISH_STATUS_OPTIONS } from "./finishStatus";

interface FinishableDeliveriesPanelProps {
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  filters: FinishableDeliveryFilters;
  deliverymanOptions: SelectOption[];
  paginationProps: Omit<
    ComponentProps<typeof TablePagination>,
    "component" | "rowsPerPageOptions"
  >;
  onFiltersChange: (changes: Partial<FinishableDeliveryFilters>) => void;
  onSelect: (delivery: Delivery) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const FinishableDeliveriesPanel = ({
  deliveries,
  loading,
  error,
  filters,
  deliverymanOptions,
  paginationProps,
  onFiltersChange,
  onSelect,
}: FinishableDeliveriesPanelProps) => {
  const colors = useSurfaceColors();
  const inputSx = useSurfaceInputSx();
  const selectSx = { borderRadius: 2, bgcolor: colors.inputBg, fontSize: 13 };
  const bodySx = { color: colors.textBody };

  const columns: DataTableColumn<Delivery>[] = [
    {
      key: "id",
      header: "ID",
      render: (d) => `#${d.id}`,
      cellSx: { color: colors.textSecondary, fontWeight: 600 },
    },
    {
      key: "client",
      header: "Cliente",
      render: (d) => (
        <>
          <Typography
            sx={{ fontWeight: 600, fontSize: 13, color: colors.textPrimary }}
          >
            {d.client.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>
            {phoneMask(d.client.phone)}
          </Typography>
        </>
      ),
    },
    {
      key: "deliveryman",
      header: "Entregador",
      render: (d) =>
        d.deliveryman
          ? `${d.deliveryman.name} ${d.deliveryman.lastName}`
          : "Não vinculado",
      cellSx: bodySx,
    },
    {
      key: "address",
      header: "Endereço",
      render: (d) => deliveryStreetLine(d.address),
      cellSx: bodySx,
    },
    {
      key: "neighborhood",
      header: "Bairro / Cidade",
      render: (d) => `${d.address.neighborhood} — ${d.address.city}`,
      cellSx: bodySx,
    },
    {
      key: "quantity",
      header: "Qtd.",
      render: (d) => d.quantity,
      cellSx: bodySx,
    },
    {
      key: "amount",
      header: "Valor",
      render: (d) => formatCurrency(d.amount),
      cellSx: { ...bodySx, whiteSpace: "nowrap" },
    },
    {
      key: "date",
      header: "Data",
      render: (d) => formatDate(d.createdAt),
      cellSx: { color: colors.textSecondary, whiteSpace: "nowrap" },
    },
    {
      key: "status",
      header: "Status",
      render: (d) => <FinishStatusChip status={d.status} compact />,
    },
  ];

  const hasFilters = Boolean(filters.search) || filters.status !== ALL;

  return (
    <SurfacePanel
      title="Pedidos de entrega"
      description="Clique em uma linha aberta ou em entrega para finalizar o pedido."
      loading={loading}
      error={error}
      loaderColor="#4361EE"
      filters={
        <>
          <SurfaceFilter label="Buscar pedido" minWidth={220}>
            <SearchField
              placeholder="Nome do cliente, entregador, ID, cidade..."
              value={filters.search}
              onChange={(search) => onFiltersChange({ search })}
              clearable
              sx={inputSx}
            />
          </SurfaceFilter>
          <SurfaceFilter label="Status do pedido" minWidth={180}>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.status}
                onChange={(event) =>
                  onFiltersChange({
                    status: event.target
                      .value as FinishableDeliveryFilters["status"],
                  })
                }
                displayEmpty
                sx={selectSx}
              >
                <MenuItem value={ALL}>Todos</MenuItem>
                {FINISH_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SurfaceFilter>
          <SurfaceFilter label="Entregador" minWidth={220}>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.deliverymanId}
                onChange={(event) =>
                  onFiltersChange({ deliverymanId: event.target.value })
                }
                displayEmpty
                sx={selectSx}
              >
                <MenuItem value={ALL}>Todos os entregadores</MenuItem>
                {deliverymanOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SurfaceFilter>
        </>
      }
    >
      <SurfaceTable
        columns={columns}
        rows={deliveries}
        getRowId={(d) => d.id}
        emptyMessage={
          hasFilters
            ? "Nenhum pedido encontrado para os filtros aplicados."
            : "Nenhum pedido encontrado no momento."
        }
        onRowClick={onSelect}
        isRowClickable={(d) => !isFinishedDelivery(d)}
      />
      <TablePagination
        component="div"
        {...paginationProps}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        sx={{
          borderTop: `1px solid ${colors.border}`,
          color: colors.textSecondary,
          fontSize: 13,
        }}
      />
    </SurfacePanel>
  );
};

export default FinishableDeliveriesPanel;
