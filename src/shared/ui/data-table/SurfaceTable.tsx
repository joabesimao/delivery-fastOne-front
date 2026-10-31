import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";
import type { DataTableColumn } from "./DataTable";

interface SurfaceTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
  isRowClickable?: (row: T) => boolean;
}

const SurfaceTable = <T,>({
  columns,
  rows,
  getRowId,
  emptyMessage,
  onRowClick,
  isRowClickable = () => Boolean(onRowClick),
}: SurfaceTableProps<T>) => {
  const colors = useSurfaceColors();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: colors.headerBg }}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  color: colors.label,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 0.3,
                  py: 1.5,
                  borderColor: colors.border,
                  whiteSpace: "nowrap",
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{
                  py: 6,
                  color: colors.textSecondary,
                  fontSize: 14,
                  borderColor: colors.border,
                }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const clickable = isRowClickable(row);
              return (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={clickable ? () => onRowClick?.(row) : undefined}
                  sx={{
                    cursor: clickable ? "pointer" : "default",
                    "&:hover": {
                      bgcolor:
                        clickable || !onRowClick ? colors.rowHover : "inherit",
                    },
                    "& td": {
                      borderColor: colors.border,
                      fontSize: 13,
                      py: 1.2,
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={column.cellSx}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SurfaceTable;
