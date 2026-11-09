import { QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "@/shared/lib/downloadFile";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { createFakeSocket } from "@/test/fakeSocket";
import { createTestQueryClient } from "@/test/renderWithQueryClient";
import { deliveriesRepository } from "../../data/deliveriesRepository";
import { defaultRankingFilters } from "../../domain/deliverymanRanking";
import DeliverymanRankingPage from "./DeliverymanRankingPage";

vi.mock("@/shared/realtime/useRealtimeSocket", () => ({ default: vi.fn() }));
vi.mock("@/shared/lib/downloadFile", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/lib/downloadFile")>()),
  downloadTextFile: vi.fn(),
}));
vi.mock("../../data/deliveriesRepository", () => ({
  deliveriesRepository: { ranking: vi.fn() },
}));

const rankingPage = {
  items: [{ deliverymanId: 1, deliverymanName: "Ana", totalDeliveries: 3 }],
  page: 1,
  totalDeliveries: 3,
  totalItems: 1,
  totalPages: 1,
};

const renderPage = () =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <DeliverymanRankingPage />
    </QueryClientProvider>,
  );

const lastRankingCall = () =>
  vi.mocked(deliveriesRepository.ranking).mock.lastCall?.[0];

describe("DeliverymanRankingPage", () => {
  let socket: ReturnType<typeof createFakeSocket>;
  const defaults = defaultRankingFilters();

  beforeEach(() => {
    vi.clearAllMocks();
    socket = createFakeSocket();
    vi.mocked(useRealtimeSocket).mockReturnValue(socket as never);
    vi.mocked(deliveriesRepository.ranking).mockResolvedValue(rankingPage);
  });

  it("recarrega com os filtros aplicados ao receber evento em tempo real", async () => {
    renderPage();
    await screen.findByText("Ana");

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2020-01-01" },
    });
    act(() => socket.emit("delivery:changed"));

    await waitFor(() =>
      expect(deliveriesRepository.ranking).toHaveBeenCalledTimes(2),
    );
    expect(lastRankingCall()).toEqual({ ...defaults, page: 1 });
  });

  it("exporta o CSV com os filtros aplicados, não com o rascunho", async () => {
    renderPage();
    await screen.findByText("Ana");

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

    await waitFor(() => expect(downloadTextFile).toHaveBeenCalled());
    expect(lastRankingCall()).toMatchObject({
      startDate: defaults.startDate,
      endDate: defaults.endDate,
    });
    expect(vi.mocked(downloadTextFile).mock.lastCall?.[1]).toContain(
      defaults.startDate,
    );
  });

  it("aplica o rascunho ao clicar em Atualizar ranking", async () => {
    renderPage();
    await screen.findByText("Ana");

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar ranking" }));

    await waitFor(() =>
      expect(lastRankingCall()).toMatchObject({ startDate: "2020-01-01" }),
    );
  });
});
