import { act } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderHookWithRouter } from "@/test/renderWithQueryClient";
import { useFleetFilters } from "./useFleetFilters";

const render = (route = "/") =>
  renderHookWithRouter(
    () => ({ filters: useFleetFilters(), location: useLocation() }),
    route,
  );

describe("useFleetFilters", () => {
  it("sem parâmetros retorna filtros vazios", () => {
    const { result } = render();
    expect(result.current.filters).toMatchObject({
      vehicleId: "",
      deliverymanId: "",
      hasFilters: false,
      params: {},
    });
  });

  it("lê os filtros da query string", () => {
    const { result } = render("/?vehicleId=3&deliverymanId=7");
    expect(result.current.filters).toMatchObject({
      vehicleId: "3",
      deliverymanId: "7",
      hasFilters: true,
      params: { vehicleId: "3", deliverymanId: "7" },
    });
  });

  it("params só inclui os filtros preenchidos", () => {
    const { result } = render("/?deliverymanId=7");
    expect(result.current.filters.params).toEqual({ deliverymanId: "7" });
  });

  it("setVehicleId grava na URL preservando o outro filtro", () => {
    const { result } = render("/?deliverymanId=7");
    act(() => result.current.filters.setVehicleId("3"));
    expect(result.current.filters.vehicleId).toBe("3");
    expect(result.current.filters.deliverymanId).toBe("7");
    expect(result.current.location.search).toContain("vehicleId=3");
  });

  it("setDeliverymanId grava na URL", () => {
    const { result } = render();
    act(() => result.current.filters.setDeliverymanId("9"));
    expect(result.current.filters.deliverymanId).toBe("9");
  });

  it("valor vazio remove o filtro da URL", () => {
    const { result } = render("/?vehicleId=3&deliverymanId=7");
    act(() => result.current.filters.setVehicleId(""));
    expect(result.current.filters.vehicleId).toBe("");
    expect(result.current.location.search).not.toContain("vehicleId");
    expect(result.current.filters.deliverymanId).toBe("7");
  });

  it("clear remove todos os filtros", () => {
    const { result } = render("/?vehicleId=3&deliverymanId=7");
    act(() => result.current.filters.clear());
    expect(result.current.filters.hasFilters).toBe(false);
    expect(result.current.location.search).toBe("");
  });
});
