import type { ReactNode } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import DataTableHead from "./DataTableHead";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  cellSx?: SxProps<Theme>;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyMessage: string;
  scrollable?: boolean;
}

const DataTable = <T,>({
  columns,
  rows,
  getRowId,
  loading = false,
  error = null,
  emptyMessage,
  scrollable = false,
}: DataTableProps<T>) => {
  const isDark = useTheme().palette.mode === "dark";

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress sx={{ color: isDark ? "#7C9CBF" : "#003459" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: isDark
          ? "0 2px 12px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,52,89,0.10)",
        border: isDark ? "none" : "1px solid #e2e8f0",
        ...(scrollable ? { overflowX: "auto" } : { overflow: "hidden" }),
      }}
    >
      <Table size="small">
        <DataTableHead columns={columns.map((column) => column.header)} />
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{
                  py: 5,
                  color: isDark ? "#7C7F8E" : "#94a3b8",
                  fontSize: 14,
                }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={getRowId(row)}
                hover
                sx={{
                  backgroundColor: isDark
                    ? index % 2 === 0
                      ? "#0e0f0f"
                      : "#0f0e0e"
                    : index % 2 === 0
                      ? "#ffffff"
                      : "#f8fafd",
                  transition: "background-color 0.15s",
                  "&:hover": {
                    backgroundColor: isDark ? "#1a2535" : "#eef4fb",
                  },
                  "& td": {
                    borderColor: isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0",
                    color: isDark ? "#C8CAD4" : "#374151",
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
