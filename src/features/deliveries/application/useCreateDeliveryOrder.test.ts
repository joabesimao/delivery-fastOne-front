import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { deliveriesRepository } from "../data/deliveriesRepository";
import type { DeliveryOrderClient } from "../domain/deliveryOrder";
import { useCreateDeliveryOrder } from "./useCreateDeliveryOrder";

vi.mock("../data/deliveriesRepository", () => ({
  deliveriesRepository: { create: vi.fn() },
}));

const client: DeliveryOrderClient = {
  registerId: 7,
  name: "Maria",
  phone: "(81) 98888-7777",
  address: {
    street: "Rua A",
    neighborhood: "Centro",
    numberHouse: "10",
    reference: "",
    city: "Recife",
  },
};

const values = {
  client,
  deliverymanId: "3",
  quantity: "2",
  amount: "R$ 25,50",
};

const setup = (print: () => Promise<void>) => {
  const onPrintError = vi.fn();
  const { result } = renderHookWithQueryClient(() =>
    useCreateDeliveryOrder({ print, onPrintError }),
  );
  return { create: result.current, onPrintError };
};

describe("useCreateDeliveryOrder", () => {
  it("cria o pedido e imprime a folha com o id retornado", async () => {
    vi.mocked(deliveriesRepository.create).mockResolvedValue({ id: 55 });
    const print = vi.fn().mockResolvedValue(undefined);
    const { create } = setup(print);

    await act(() => create(values, client));

    expect(deliveriesRepository.create).toHaveBeenCalledWith({
      registerId: 7,
      deliverymanId: 3,
      quantity: "2",
      amount: 25.5,
    });
    expect(print).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 55,
        client,
        quantity: "2",
        amount: 25.5,
      }),
    );
  });

  it("não falha a criação quando a impressão falha e avisa à parte", async () => {
    vi.mocked(deliveriesRepository.create).mockResolvedValue({ id: 55 });
    const { create, onPrintError } = setup(() =>
      Promise.reject(new Error("pdf")),
    );

    await expect(act(() => create(values, client))).resolves.toBeUndefined();
    expect(onPrintError).toHaveBeenCalledTimes(1);
  });

  it("não espera a impressão terminar para concluir a criação", async () => {
    vi.mocked(deliveriesRepository.create).mockResolvedValue({ id: 55 });
    const { create } = setup(() => new Promise<void>(() => {}));

    await expect(act(() => create(values, client))).resolves.toBeUndefined();
  });

  it("propaga a falha da criação sem imprimir", async () => {
    vi.mocked(deliveriesRepository.create).mockRejectedValue(new Error("api"));
    const print = vi.fn();
    const { create, onPrintError } = setup(print);

    await expect(act(() => create(values, client))).rejects.toThrow("api");
    expect(print).not.toHaveBeenCalled();
    expect(onPrintError).not.toHaveBeenCalled();
  });
});
