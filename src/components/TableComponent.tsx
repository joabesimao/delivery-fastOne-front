import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

type TableComponentProps<T extends Record<string, any>> = {
  data: T[];
  columns: MRT_ColumnDef<T>[];
};

const TableComponent = <T extends Record<string, any>>({
  data,
  columns,
  ...rest
}: TableComponentProps<T>) => {
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  const table = useMaterialReactTable({
    columns: memoizedColumns,
    data: memoizedData,
    localization: {
      actions: "Ações",
      and: "e",
      search: "Pesquisar",
      showAll: "mostre tudo",
      hideAll: "Limpar tudo",
      showHideSearch: "mostrar/Ocultar pesquisa",
      showHideFilters: "mostrar/Ocultar filtro",
      showHideColumns: "mostrar/Ocultar colunas",
      clearSearch: "limpar pesquisa",
      filterByColumn: "Pesquise",
      rowsPerPage: "linhas por página",
      sortedByColumnAsc: "ordenado por ordem crescente",
      sortByColumnAsc: "classificar por ordem crescente",
      sortedByColumnDesc: "ordenado por ordem decrescente",
    },
    enableEditing: true,
    getRowId: (row, index) => String(row?.id || index),
    positionActionsColumn: "last",
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableFilters: true,
    enableHiding: false,
    renderRowActions: () => null,
    ...rest,
    muiTablePaperProps: {
      elevation: 0,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default TableComponent;
