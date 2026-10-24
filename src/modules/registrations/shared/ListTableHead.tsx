import { TableCell, TableHead, TableRow, useTheme } from "@mui/material";

type ListTableHeadProps = {
  columns: string[];
};

export default function ListTableHead({ columns }: ListTableHeadProps) {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <TableHead>
      <TableRow
        sx={{
          background: isDark
            ? "#003459"
            : "linear-gradient(90deg, #003459 0%, #005588 100%)",
        }}
      >
        {columns.map((col) => (
          <TableCell
            key={col}
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
            {col}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
