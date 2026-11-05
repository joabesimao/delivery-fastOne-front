import { act } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/shared/config/routes";
import { closeRealtimeSocket } from "@/shared/realtime/realtimeSocket";
import { session } from "@/shared/session/session";
import { renderHookWithRouter } from "@/test/renderWithQueryClient";
import { useLogout } from "./useLogout";

vi.mock("@/shared/realtime/realtimeSocket", () => ({
  closeRealtimeSocket: vi.fn(),
}));

vi.mock("@/shared/session/session", () => ({
  session: { clear: vi.fn() },
}));

describe("useLogout", () => {
  it("fecha o socket, limpa a sessão e navega para o login", () => {
    const { result } = renderHookWithRouter(
      () => ({ logout: useLogout(), location: useLocation() }),
      "/dashboard",
    );
    act(() => result.current.logout());
    expect(closeRealtimeSocket).toHaveBeenCalledTimes(1);
    expect(session.clear).toHaveBeenCalledTimes(1);
    expect(result.current.location.pathname).toBe(ROUTES.login);
  });
});
