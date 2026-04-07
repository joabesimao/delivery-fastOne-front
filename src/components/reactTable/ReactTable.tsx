import React, { Fragment } from "react";
import {
  MRT_GlobalFilterTextField,
  MRT_TableBodyCellValue,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  flexRender,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MaterialReactTableProps,
} from "material-react-table";
import {
  Box,
  Divider,
  InputLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import CircularProgress from "@mui/material/CircularProgress";
import AutocompleteComponent from "../AutoCompleteComponent";
import type {
  DataFilters,
  FilterState,
  ShowFilter,
} from "../../types/dataFilters";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { TypographyProps } from "@mui/material/Typography";

type TypographyVariant = TypographyProps["variant"];

interface ReactTableProps<TData extends Record<string, any>> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  title?: string;
  variantTitle?: TypographyVariant;
  sxTitle?: React.CSSProperties;
  sxTableContainer?: React.CSSProperties;
  subTitle?: string;
  hideDividerTitle?: boolean;
  tableOptions?: Partial<MaterialReactTableProps<TData>>;
  labelSearch?: string;
  placeholderSearch?: string;
  actions?: React.ReactNode;
  childrenComponent?: React.ReactNode;
  extraFilters?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  infoLitEmpty?: string | React.ReactNode;
  totalRows?: number;
  pageCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  enableServerSidePagination?: boolean;
  onGlobalFilterChange?: (searchValue: string) => void;
  globalFilter?: string;
  dataFilters?: DataFilters;
  filters?: FilterState;
  onFilterChange?: <K extends keyof FilterState>(
    key: K,
  ) => (event: React.SyntheticEvent, value: FilterState[K]) => void;
  showFilter?: ShowFilter;
  actionsOnTheResearchSide?: boolean;
  hidePagination?: boolean;
  removeMarginTable?: boolean;
  hideFullRegistration?: boolean;
}

const ReactTable = <TData extends Record<string, any>>({
  columns,
  data,
  isLoading,
  title = "",
  variantTitle = "h6",
  sxTitle,
  sxTableContainer,
  tableOptions,
  labelSearch,
  placeholderSearch,
  actions,
  extraFilters,
  isError,
  hideDividerTitle = false,
  subTitle = "",
  infoLitEmpty = "",
  totalRows,
  pageCount,
  currentPage = 0,
  pageSize = 5,
  onPaginationChange,
  enableServerSidePagination = false,
  onGlobalFilterChange,
  globalFilter = "",
  dataFilters,
  filters,
  onFilterChange,
  showFilter,
  actionsOnTheResearchSide = false,
  hidePagination = false,
  removeMarginTable = false,
  hideFullRegistration = false,
  childrenComponent,
}: ReactTableProps<TData>) => {
  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: false,
    manualPagination: enableServerSidePagination,
    manualFiltering: enableServerSidePagination,
    rowCount: enableServerSidePagination ? totalRows : undefined,
    pageCount: enableServerSidePagination ? pageCount : undefined,
    initialState: {
      pagination: { pageSize, pageIndex: currentPage },
      showGlobalFilter: true,
    },
    state: {
      isLoading,
      globalFilter: enableServerSidePagination ? globalFilter : undefined,
      ...(enableServerSidePagination && {
        pagination: { pageIndex: currentPage, pageSize },
      }),
    },
    onGlobalFilterChange: enableServerSidePagination
      ? (updater) => {
          if (typeof updater === "function") {
            const newFilter = updater(globalFilter);
            onGlobalFilterChange?.(newFilter || "");
          } else {
            onGlobalFilterChange?.(updater || "");
          }
        }
      : undefined,
    onPaginationChange: enableServerSidePagination
      ? (updater) => {
          if (typeof updater === "function") {
            const newPagination = updater({ pageIndex: currentPage, pageSize });
            onPaginationChange?.(
              newPagination.pageIndex,
              newPagination.pageSize,
            );
          } else {
            onPaginationChange?.(updater.pageIndex, updater.pageSize);
          }
        }
      : undefined,
    localization: MRT_Localization_PT_BR,
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 15],
      variant: "outlined",
      sx: {
        "& .MuiTablePagination-toolbar": {
          px: { xs: 0.5, md: 2 },
          minHeight: { xs: 36, md: 48 },
          gap: { xs: 1, md: 2 },
          flexWrap: { xs: "wrap", md: "nowrap" },
        },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            fontSize: { xs: "0.60rem", md: "0.75rem" },
            m: 0,
          },
        "& .MuiTablePagination-select": {
          fontSize: { xs: "0.70rem", md: "0.75rem" },
          py: { xs: 0, md: 0.5 },
        },
        "& .MuiTablePagination-actions": {
          ml: { xs: 0, md: 2 },
        },
        "& .MuiIconButton-root": {
          p: { xs: 0.25, md: 0.5 },
          width: { xs: 28, md: 36 },
          height: { xs: 28, md: 36 },
        },
        "& .MuiSvgIcon-root": {
          fontSize: { xs: "1rem", md: "1.25rem" },
        },
      },
    },
    paginationDisplayMode: "pages",
    muiSearchTextFieldProps: {
      placeholder: placeholderSearch || "Pesquisar...",
      fullWidth: true,
      sx: {
        width: { xs: "100%", sm: "100%", md: "350px" },
        "& input": {
          padding: "8px 12px",
          fontSize: "0.875rem",
        },
      },
    },
    ...tableOptions,
  });

  return (
    <Stack
      sx={{
        mt: {
          xs: !removeMarginTable ? "10px" : "0px",
          md: !removeMarginTable ? "20px" : "0px",
        },
        mb: {
          xs: !removeMarginTable ? "10px" : "0px",
          md: !removeMarginTable ? "20px" : "0px",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent={{ xs: "center", md: "space-between" }}
        alignItems={{ xs: "start", md: "center" }}
      >
        <Stack direction="column">
          <Typography
            variant={variantTitle}
            fontWeight={600}
            color="#181C32"
            sx={{ ...sxTitle }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="#71717A"
            display={subTitle ? "block" : "none"}
            lineHeight={{ xs: "15px", md: "10px" }}
          >
            {subTitle}
          </Typography>
        </Stack>
        {!actionsOnTheResearchSide && actions}
      </Stack>
      <Divider
        sx={{
          mb: {
            xs: removeMarginTable ? "0px" : "5px",
            md: removeMarginTable ? "0px" : "20px",
          },
          mt: {
            xs: hideDividerTitle ? "0px" : "5px",
            md: removeMarginTable ? "0px" : "20px",
          },
          borderColor: hideDividerTitle ? "transparent" : "#E0E0E0",
        }}
      />
      <Box
        sx={{ display: !table.getState().showGlobalFilter ? "flex" : "none" }}
      >
        {extraFilters && extraFilters}
      </Box>
      <Box
        sx={{
          display: table.getState().showGlobalFilter ? "flex" : "none",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          mb: { xs: 1, sm: 1, md: 2 },
          gap: { xs: "10px", md: "15px" },
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <Stack
          direction="column"
          gap="5px"
          sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
        >
          <InputLabel sx={{ fontWeight: 600, color: "#3F4254" }}>
            {labelSearch}
          </InputLabel>
          <MRT_GlobalFilterTextField
            table={table}
            fullWidth
            sx={{
              width: { xs: "100%", sm: "100%", md: "300px" },
              flex: { xs: "1 1 100%", sm: "1 1 100%", md: "0 0 auto" },
            }}
          />
        </Stack>
        {extraFilters && extraFilters}
        {actionsOnTheResearchSide && actions}
        {showFilter?.showUnitFilter && (
          <Stack direction="column" width={"270px"}>
            <AutocompleteComponent
              name="selectedUnit"
              label="Busque por uma unidade escolar"
              placeholder={
                dataFilters?.isLoadingSchools
                  ? "Carregando unidades..."
                  : "Selecione uma unidade escolar"
              }
              options={dataFilters?.schools ?? []}
              value={filters?.selectedUnit}
              onChange={(event, newUnit) => {
                onFilterChange?.("selectedUnit")(event, newUnit);
                if (showFilter.showRoleFilter)
                  onFilterChange?.("selectedRole")(event, null);
                if (showFilter.showStatusFilter)
                  onFilterChange?.("selectedStatus")(
                    event,
                    dataFilters?.isStatus?.[0],
                  );
              }}
              disabled={dataFilters?.isLoadingSchools}
              error={!filters?.selectedUnit}
              loading={dataFilters?.isLoadingSchools}
              hasFormik={false}
            />
          </Stack>
        )}
        {showFilter?.showRoleFilter && (
          <Stack direction="column" gap="5px" width={"250px"}>
            <AutocompleteComponent
              name={"roles"}
              label="Busque por perfis"
              placeholder={
                (dataFilters?.isLoadingRoles ?? true)
                  ? "Carregando perfis..."
                  : filters?.selectedUnit
                    ? "Selecione um perfil"
                    : "Selecione uma unidade escolar para continuar"
              }
              options={dataFilters?.roles ?? []}
              value={filters?.selectedRole}
              onChange={onFilterChange?.("selectedRole")}
              disabled={dataFilters?.isLoadingRoles || !filters?.selectedUnit}
              loading={dataFilters?.isLoadingRoles}
              hasFormik={false}
            />
          </Stack>
        )}
        {showFilter?.showStatusFilter && (
          <Stack direction="column" gap="5px" width={"250px"}>
            <AutocompleteComponent
              name={"isStatus"}
              label="Filtre por status"
              placeholder={"Selecione um status"}
              options={dataFilters?.isStatus ?? []}
              value={filters?.selectedStatus}
              onChange={onFilterChange?.("selectedStatus")}
              hasFormik={false}
            />
          </Stack>
        )}
      </Box>
      {childrenComponent ? childrenComponent : null}
      <TableContainer sx={{ ...sxTableContainer }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { muiTableHeadCellProps } = header.column.columnDef;
                  const tableCellProps =
                    typeof muiTableHeadCellProps === "function"
                      ? muiTableHeadCellProps({ column: header.column, table })
                      : muiTableHeadCellProps;

                  return (
                    <TableCell
                      align="left"
                      variant="head"
                      key={header.id}
                      {...tableCellProps}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.Header ??
                              header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={
                    table.getHeaderGroups()?.[0]?.headers.length ||
                    table.getVisibleFlatColumns().length ||
                    table.getVisibleLeafColumns().length ||
                    columns.length ||
                    1
                  }
                  align="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Ocorreu um erro ao carregar os dados.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    table.getHeaderGroups()?.[0]?.headers.length ||
                    table.getVisibleFlatColumns().length ||
                    table.getVisibleLeafColumns().length ||
                    columns.length ||
                    1
                  }
                  align="center"
                >
                  {typeof infoLitEmpty === "string" ||
                  infoLitEmpty === undefined ? (
                    <Typography variant="body1" color="text.secondary">
                      {infoLitEmpty || "Nenhum dado para exibir."}
                      {!filters?.selectedUnit && showFilter?.showUnitFilter && (
                        <>
                          <br />
                          Selecione uma unidade escolar para realizar a busca
                        </>
                      )}
                    </Typography>
                  ) : (
                    infoLitEmpty
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => {
                const isRowExpanded = row.getIsExpanded();
                return (
                  <Fragment key={row.id}>
                    <TableRow selected={row.getIsSelected()}>
                      {row.getVisibleCells().map((cell) => {
                        const { muiTableBodyCellProps } = cell.column.columnDef;

                        const cellProps =
                          typeof muiTableBodyCellProps === "function"
                            ? muiTableBodyCellProps({
                                cell,
                                column: cell.column,
                                row,
                                table,
                              })
                            : muiTableBodyCellProps;

                        const isExpandColumn =
                          cell.column.id === "mrt-row-expand";

                        return (
                          <TableCell
                            key={cell.id}
                            variant="body"
                            {...cellProps}
                          >
                            {isExpandColumn ? (
                              <Box
                                sx={{
                                  cursor: "pointer",
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                                onClick={() =>
                                  table.setExpanded({
                                    [row.id]: !isRowExpanded,
                                  })
                                }
                              >
                                {isRowExpanded ? (
                                  <ExpandLessIcon sx={{ color: "#181C32" }} />
                                ) : (
                                  <ExpandMoreIcon sx={{ color: "#181C32" }} />
                                )}
                              </Box>
                            ) : (
                              <MRT_TableBodyCellValue
                                cell={cell}
                                table={table}
                                staticRowIndex={rowIndex}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {isRowExpanded && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <Box sx={{ width: "100%" }}>
                            {tableOptions?.renderDetailPanel ? (
                              tableOptions.renderDetailPanel({ row, table })
                            ) : (
                              <Box p={2}>
                                <Typography>
                                  Detalhes não disponíveis
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent={{
          xs: hideFullRegistration ? "flex-end" : "center",
          md: hideFullRegistration ? "flex-end" : "space-between",
        }}
        alignItems="center"
        mt={{ xs: 2, md: 2 }}
        display={hidePagination ? "none" : "flex"}
      >
        <Typography
          variant="body1"
          color="text.secondary"
          display={hideFullRegistration ? "none" : "block"}
        >
          Total:{" "}
          {enableServerSidePagination
            ? totalRows || 0
            : table.getFilteredRowModel().rows.length}
          {(enableServerSidePagination
            ? totalRows || 0
            : table.getFilteredRowModel().rows.length) === 1
            ? " registro"
            : " registros"}
        </Typography>
        <Stack>
          <MRT_TablePagination table={table} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ReactTable;
