import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { notificationsRepository } from "../data/notificationsRepository";
import { useBroadcastNotice } from "./useBroadcastNotice";

vi.mock("../data/notificationsRepository", () => ({
  notificationsRepository: { broadcast: vi.fn() },
}));

const payload = { title: "Aviso", body: "Reunião às 10h" } as never;

describe("useBroadcastNotice", () => {
  beforeEach(() => {
    vi.mocked(notificationsRepository.broadcast).mockResolvedValue(5);
  });

  it("envia o aviso ao repositório e devolve o número de destinatários", async () => {
    const { result } = renderHookWithQueryClient(() => useBroadcastNotice());
    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notificationsRepository.broadcast).toHaveBeenCalledWith(payload);
    expect(result.current.data).toBe(5);
  });

  it("expõe o erro quando o envio falha", async () => {
    vi.mocked(notificationsRepository.broadcast).mockRejectedValue(
      new Error("falhou"),
    );
    const { result } = renderHookWithQueryClient(() => useBroadcastNotice());
    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("falhou");
  });
});
