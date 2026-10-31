import { useMemo, useState, type ChangeEvent } from "react";

interface ClientPaginationOptions {
  initialRowsPerPage?: number;
  resetKey?: string;
}

export const useClientPagination = <T>(
  items: T[],
  { initialRowsPerPage = 10, resetKey = "" }: ClientPaginationOptions = {},
) => {
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [state, setState] = useState({ page: 0, resetKey });

  const requestedPage = state.resetKey === resetKey ? state.page : 0;
  const lastPage = Math.max(0, Math.ceil(items.length / rowsPerPage) - 1);
  const page = Math.min(requestedPage, lastPage);

  const pageItems = useMemo(
    () => items.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [items, page, rowsPerPage],
  );

  return {
    pageItems,
    paginationProps: {
      count: items.length,
      page,
      rowsPerPage,
      onPageChange: (_: unknown, nextPage: number) =>
        setState({ page: nextPage, resetKey }),
      onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setState({ page: 0, resetKey });
      },
    },
  };
};
