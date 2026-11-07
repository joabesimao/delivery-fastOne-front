import { act } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/shared/config/routes";
import { closeRealtimeSocket } from "@/shared/realtime/realtimeSocket";
import { session } from "@/shared/session/session";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { useLogout } from "./useLogout";

vi.mock("@/shared/realtime/realtimeSocket", () => ({
  closeRealtimeSocket: vi.fn(),
}));

vi.mock("@/shared/session/session", () => ({
  session: { clear: vi.fn() },
}));

const renderLogout = () =>
  renderHookWithQueryClient(
    () => ({ logout: useLogout(), location: useLocation() }),
    { route: "/dashboard", withRouter: true },
  );

describe("useLogout", () => {
  it("fecha o socket, limpa a sessão e navega para o login", () => {
    const { result } = renderLogout();
    act(() => result.current.logout());
    expect(closeRealtimeSocket).toHaveBeenCalledTimes(1);
    expect(session.clear).toHaveBeenCalledTimes(1);
    expect(result.current.location.pathname).toBe(ROUTES.login);
  });

  it("descarta o cache de queries para o próximo usuário não ver dados da sessão anterior", () => {
    const { result, queryClient } = renderLogout();
    queryClient.setQueryData(["deliveries", "list"], [{ id: 1 }]);
    queryClient.setQueryData(["clients", "list"], [{ id: 2 }]);

    act(() => result.current.logout());

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
