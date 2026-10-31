import { useState } from "react";

export const useResettablePage = (resetKey: string, initialPage = 0) => {
  const [state, setState] = useState({ page: initialPage, resetKey });
  const page = state.resetKey === resetKey ? state.page : initialPage;
  const setPage = (next: number) => setState({ page: next, resetKey });
  return [page, setPage] as const;
};
