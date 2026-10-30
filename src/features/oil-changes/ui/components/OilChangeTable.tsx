import type { FleetRecord } from "@/features/fleet";
import { formatUtcDate } from "@/shared/lib/date/dateOnly";
import DataTable, {
  type DataTableColumn,
} from "@/shared/ui/data-table/DataTable";
import IdChip from "@/shared/ui/data-table/IdChip";
import RowActions from "@/shared/ui/data-table/RowActions";
import type { OilChange } from "../../domain/oilChange";

interface OilChangeTableProps {
  oilChanges: OilChange[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  canManage: boolean;
  busyId: number | null;
  vehicleLabelOf: (record: FleetRecord) => string;
  deliverymanLabelOf: (record: FleetRecord) => string;
  onEdit: (oilChange: OilChange) => void;
  onDelete: (oilChange: OilChange) => void;
}

const OilChangeTable = ({
  oilChanges,
  loading,
  error,
  emptyMessage,
  canManage,
  busyId,
  vehicleLabelOf,
  deliverymanLabelOf,
  onEdit,
  onDelete,
}: OilChangeTableProps) => {
  const columns: DataTableColumn<OilChange>[] = [
    { key: "id", header: "#", render: (o) => <IdChip id={o.id} /> },
    {
      key: "vehicle",
      header: "Veículo",
      render: vehicleLabelOf,
      cellSx: (theme) => ({
        fontWeight: 600,
        color: `${theme.palette.mode === "dark" ? "#E2E4EC" : "#111827"} !important`,
      }),
    },
    { key: "deliveryman", header: "Entregador", render: deliverymanLabelOf },
    {
      key: "km",
      header: "Km lançado",
      render: (o) => `${o.km.toLocaleString("pt-BR")} km`,
    },
    {
      key: "nextChangeKm",
      header: "Km próxima troca",
      render: (o) => `${o.nextChangeKm.toLocaleString("pt-BR")} km`,
    },
    { key: "date", header: "Data", render: (o) => formatUtcDate(o.changeDate) },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Ações",
            render: (o: OilChange) => (
              <RowActions
                disabled={busyId === o.id}
                onEdit={() => onEdit(o)}
                onDelete={() => onDelete(o)}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={oilChanges}
      getRowId={(o) => o.id}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
      scrollable
    />
  );
};

export default OilChangeTable;
