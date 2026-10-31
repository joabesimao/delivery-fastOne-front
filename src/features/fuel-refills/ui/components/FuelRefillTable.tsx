import type { FleetRecord } from "@/features/fleet";
import { formatUtcDate } from "@/shared/lib/date/dateOnly";
import DataTable, {
  type DataTableColumn,
} from "@/shared/ui/data-table/DataTable";
import IdChip from "@/shared/ui/data-table/IdChip";
import RowActions from "@/shared/ui/data-table/RowActions";
import { fuelConsumption, type FuelRefill } from "../../domain/fuelRefill";

import { COLORS } from "@/shared/theme/colors";
const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const PRICE_PER_LITER_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

interface FuelRefillTableProps {
  refills: FuelRefill[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  canManage: boolean;
  busyId: number | null;
  vehicleLabelOf: (record: FleetRecord) => string;
  deliverymanLabelOf: (record: FleetRecord) => string;
  onEdit: (refill: FuelRefill) => void;
  onDelete: (refill: FuelRefill) => void;
}

const FuelRefillTable = ({
  refills,
  loading,
  error,
  emptyMessage,
  canManage,
  busyId,
  vehicleLabelOf,
  deliverymanLabelOf,
  onEdit,
  onDelete,
}: FuelRefillTableProps) => {
  const columns: DataTableColumn<FuelRefill>[] = [
    { key: "id", header: "#", render: (r) => <IdChip id={r.id} /> },
    {
      key: "vehicle",
      header: "Veículo",
      render: vehicleLabelOf,
      cellSx: (theme) => ({
        fontWeight: 600,
        color: `${theme.palette.mode === "dark" ? COLORS.inkOnDark : COLORS.ink} !important`,
      }),
    },
    { key: "deliveryman", header: "Entregador", render: deliverymanLabelOf },
    {
      key: "km",
      header: "Km atual",
      render: (r) => `${r.km.toLocaleString("pt-BR")} km`,
    },
    {
      key: "kmDriven",
      header: "Km rodado",
      render: (r) =>
        r.kmDriven === null ? "—" : `${r.kmDriven.toLocaleString("pt-BR")} km`,
    },
    {
      key: "liters",
      header: "Litros",
      render: (r) => `${Number(r.liters).toFixed(2)} L`,
    },
    {
      key: "pricePerLiter",
      header: "Preço/L",
      render: (r) =>
        r.pricePerLiter === null
          ? "—"
          : PRICE_PER_LITER_FORMATTER.format(Number(r.pricePerLiter)),
    },
    {
      key: "totalValue",
      header: "Valor",
      render: (r) => CURRENCY_FORMATTER.format(Number(r.totalValue)),
    },
    { key: "consumption", header: "Consumo", render: fuelConsumption },
    { key: "date", header: "Data", render: (r) => formatUtcDate(r.refillDate) },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Ações",
            render: (r: FuelRefill) => (
              <RowActions
                disabled={busyId === r.id}
                onEdit={() => onEdit(r)}
                onDelete={() => onDelete(r)}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={refills}
      getRowId={(r) => r.id}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
      scrollable
    />
  );
};

export default FuelRefillTable;
