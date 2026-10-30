import DataTable, {
  type DataTableColumn,
} from "@/shared/ui/data-table/DataTable";
import IdChip from "@/shared/ui/data-table/IdChip";
import RowActions from "@/shared/ui/data-table/RowActions";
import type { Neighborhood } from "../../domain/neighborhood";

interface NeighborhoodTableProps {
  neighborhoods: Neighborhood[];
  loading: boolean;
  error: string | null;
  busyNeighborhoodId: number | null;
  onEdit: (neighborhood: Neighborhood) => void;
  onDelete: (neighborhood: Neighborhood) => void;
}

const NeighborhoodTable = ({
  neighborhoods,
  loading,
  error,
  busyNeighborhoodId,
  onEdit,
  onDelete,
}: NeighborhoodTableProps) => {
  const columns: DataTableColumn<Neighborhood>[] = [
    { key: "id", header: "#", render: (n) => <IdChip id={n.id} /> },
    {
      key: "name",
      header: "Bairro",
      render: (n) => n.name,
      cellSx: (theme) => ({
        fontWeight: 600,
        color: `${theme.palette.mode === "dark" ? "#E2E4EC" : "#111827"} !important`,
      }),
    },
    { key: "city", header: "Cidade", render: (n) => n.cityName ?? "—" },
    {
      key: "actions",
      header: "Ações",
      render: (n) => (
        <RowActions
          disabled={busyNeighborhoodId === n.id}
          onEdit={() => onEdit(n)}
          onDelete={() => onDelete(n)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={neighborhoods}
      getRowId={(n) => n.id}
      loading={loading}
      error={error}
      emptyMessage="Nenhum bairro cadastrado."
    />
  );
};

export default NeighborhoodTable;
