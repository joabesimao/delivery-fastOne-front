import { TableCell, TableHead, TableRow, useTheme } from "@mui/material";

import { COLORS } from "@/shared/theme/colors";
interface DataTableHeadProps {
  columns: string[];
}

const DataTableHead = ({ columns }: DataTableHeadProps) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <TableHead>
      <TableRow
        sx={{
          background: isDark
            ? COLORS.navy
            : "linear-gradient(90deg, #003459 0%, #005588 100%)",
        }}
      >
        {columns.map((column) => (
          <TableCell
            key={column}
            sx={{
              backgroundColor: "transparent",
              color: "#e7dbdb",
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: "nowrap",
              letterSpacing: 0.4,
              borderBottom: "none",
              py: 1.5,
            }}
          >
            {column}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default DataTableHead;
