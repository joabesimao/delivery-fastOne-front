import { useMemo } from "react";
import {
  deliverymanFullName,
  type DeliverymanSummary,
} from "@/features/deliverymen";
import DataTable, {
  type DataTableColumn,
} from "@/shared/ui/data-table/DataTable";
import IdChip from "@/shared/ui/data-table/IdChip";
import RowActions from "@/shared/ui/data-table/RowActions";
import type { Vehicle } from "../../domain/vehicle";

interface VehicleTableProps {
  vehicles: Vehicle[];
  deliverymen: DeliverymanSummary[];
  loading: boolean;
  error: string | null;
  busyVehicleId: number | null;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const VehicleTable = ({
  vehicles,
  deliverymen,
  loading,
  error,
  busyVehicleId,
  onEdit,
  onDelete,
}: VehicleTableProps) => {
  const deliverymanNameById = useMemo(
    () => new Map(deliverymen.map((d) => [d.id, deliverymanFullName(d)])),
    [deliverymen],
  );

  const columns: DataTableColumn<Vehicle>[] = [
    { key: "id", header: "#", render: (v) => <IdChip id={v.id} /> },
    {
      key: "plate",
      header: "Placa",
      render: (v) => v.plate,
      cellSx: (theme) => ({
        fontWeight: 600,
        color: `${theme.palette.mode === "dark" ? "#E2E4EC" : "#111827"} !important`,
      }),
    },
    { key: "model", header: "Modelo", render: (v) => v.model },
    { key: "brand", header: "Marca", render: (v) => v.brand || "—" },
    {
      key: "deliveryman",
      header: "Entregador",
      render: (v) =>
        (v.deliverymanId && deliverymanNameById.get(v.deliverymanId)) || "—",
    },
    {
      key: "actions",
      header: "Ações",
      render: (v) => (
        <RowActions
          disabled={busyVehicleId === v.id}
          onEdit={() => onEdit(v)}
          onDelete={() => onDelete(v)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={vehicles}
      getRowId={(v) => v.id}
      loading={loading}
      error={error}
      emptyMessage="Nenhum veículo cadastrado."
    />
  );
};

export default VehicleTable;
