import type { ComponentProps } from "react";
import { Box, TablePagination, Typography } from "@mui/material";
import { useSurfaceColors } from "@/shared/theme/useSurfaceColors";

export type PaginationProps = Omit<
  ComponentProps<typeof TablePagination>,
  "component" | "rowsPerPageOptions"
>;

interface SurfacePaginationFooterProps {
  total: number;
  paginationProps: PaginationProps;
}

const SurfacePaginationFooter = ({
  total,
  paginationProps,
}: SurfacePaginationFooterProps) => {
  const colors = useSurfaceColors();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      sx={{ borderTop: `1px solid ${colors.border}` }}
    >
      <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
        Total: {total} registro{total !== 1 ? "s" : ""}
      </Typography>
      <TablePagination
        component="div"
        {...paginationProps}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        sx={{
          "& .MuiTablePagination-toolbar": { minHeight: 48 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: 12, color: colors.textSecondary },
          color: colors.textSecondary,
        }}
      />
    </Box>
  );
};

export default SurfacePaginationFooter;
