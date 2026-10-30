import DataTable, {
  type DataTableColumn,
} from "@/shared/ui/data-table/DataTable";
import IdChip from "@/shared/ui/data-table/IdChip";
import RowActions from "@/shared/ui/data-table/RowActions";
import type { City } from "../../domain/city";

interface CityTableProps {
  cities: City[];
  loading: boolean;
  error: string | null;
  busyCityId: number | null;
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
}

const CityTable = ({
  cities,
  loading,
  error,
  busyCityId,
  onEdit,
  onDelete,
}: CityTableProps) => {
  const columns: DataTableColumn<City>[] = [
    { key: "id", header: "#", render: (c) => <IdChip id={c.id} /> },
    {
      key: "name",
      header: "Nome",
      render: (c) => c.name,
      cellSx: (theme) => ({
        fontWeight: 600,
        color: `${theme.palette.mode === "dark" ? "#E2E4EC" : "#111827"} !important`,
      }),
    },
    {
      key: "actions",
      header: "Ações",
      render: (c) => (
        <RowActions
          disabled={busyCityId === c.id}
          onEdit={() => onEdit(c)}
          onDelete={() => onDelete(c)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={cities}
      getRowId={(c) => c.id}
      loading={loading}
      error={error}
      emptyMessage="Nenhuma cidade cadastrada."
    />
  );
};

export default CityTable;
