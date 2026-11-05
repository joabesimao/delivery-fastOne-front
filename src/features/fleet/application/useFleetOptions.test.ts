import { describe, expect, it, vi } from "vitest";
import { useDeliverymen } from "@/features/deliverymen";
import { useVehicles } from "@/features/vehicles";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import type { FleetRecord } from "../domain/fleetRecord";
import { useFleetOptions } from "./useFleetOptions";

vi.mock("@/features/vehicles", async () => ({
  vehicleLabel: (await import("@/features/vehicles/domain/vehicle"))
    .vehicleLabel,
  useVehicles: vi.fn(),
}));

vi.mock("@/features/deliverymen", async () => ({
  deliverymanFullName: (
    await import("@/features/deliverymen/domain/deliveryman")
  ).deliverymanFullName,
  useDeliverymen: vi.fn(),
}));

const vehicles = [
  { id: 1, plate: "ABC1D23", model: "Fiat Uno" },
  { id: 2, plate: "XYZ9K88", model: "Honda CG" },
];
const deliverymen = [{ id: 10, name: "Ana", lastName: "Lima" }];

const mockData = (v: unknown, d: unknown) => {
  vi.mocked(useVehicles).mockReturnValue({ data: v } as never);
  vi.mocked(useDeliverymen).mockReturnValue({ data: d } as never);
};

const record = (overrides: Partial<FleetRecord>): FleetRecord => ({
  vehicleId: 1,
  deliverymanId: 10,
  vehicle: null,
  deliveryman: null,
  ...overrides,
});

describe("useFleetOptions", () => {
  it("monta as opções de veículos e entregadores", () => {
    mockData(vehicles, deliverymen);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    expect(result.current.vehicleOptions).toEqual([
      { value: "1", label: "ABC1D23 — Fiat Uno" },
      { value: "2", label: "XYZ9K88 — Honda CG" },
    ]);
    expect(result.current.deliverymanOptions).toEqual([
      { value: "10", label: "Ana Lima" },
    ]);
  });

  it("retorna listas vazias enquanto os dados não chegam", () => {
    mockData(undefined, undefined);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    expect(result.current.vehicleOptions).toEqual([]);
    expect(result.current.deliverymanOptions).toEqual([]);
  });

  it("vehicleLabelOf usa o veículo embutido no registro", () => {
    mockData([], []);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    const label = result.current.vehicleLabelOf(
      record({ vehicle: { plate: "AAA0A00", model: "Moto" } }),
    );
    expect(label).toBe("AAA0A00 — Moto");
  });

  it("vehicleLabelOf recorre às opções pelo id", () => {
    mockData(vehicles, deliverymen);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    expect(result.current.vehicleLabelOf(record({ vehicleId: 2 }))).toBe(
      "XYZ9K88 — Honda CG",
    );
  });

  it("vehicleLabelOf retorna travessão quando não encontra", () => {
    mockData(vehicles, deliverymen);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    expect(result.current.vehicleLabelOf(record({ vehicleId: 99 }))).toBe("—");
  });

  it("deliverymanLabelOf usa o entregador embutido no registro", () => {
    mockData([], []);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    const label = result.current.deliverymanLabelOf(
      record({ deliveryman: { name: "Bia", lastName: "Souza" } }),
    );
    expect(label).toBe("Bia Souza");
  });

  it("deliverymanLabelOf recorre às opções pelo id", () => {
    mockData(vehicles, deliverymen);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    expect(result.current.deliverymanLabelOf(record({}))).toBe("Ana Lima");
  });

  it("deliverymanLabelOf retorna travessão quando não encontra", () => {
    mockData(vehicles, deliverymen);
    const { result } = renderHookWithQueryClient(() => useFleetOptions());
    expect(
      result.current.deliverymanLabelOf(record({ deliverymanId: 99 })),
    ).toBe("—");
  });
});
