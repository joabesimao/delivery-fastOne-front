import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/config/routes";
import { buildNavItems, isNavItemActive } from "./navItems";

const findItem = (label: string, role: string | null = "user") =>
  buildNavItems(role, 0).find((item) => item.label === label);

describe("buildNavItems", () => {
  it("mostra Relatórios ativo também no ranking de entregadores", () => {
    const item = findItem("Relatórios");
    expect(item?.path).toBe(ROUTES.deliveryReports);
    expect(isNavItemActive(item!, ROUTES.deliverymanReports)).toBe(true);
  });

  it("mantém Localidades ativo na aba de bairros", () => {
    const item = findItem("Localidades");
    expect(isNavItemActive(item!, ROUTES.registerNeighborhoods)).toBe(true);
  });

  it.each(["admin", "gerente_estoque"])(
    "mostra Configurações de Frota para %s",
    (role) => {
      expect(findItem("Configurações de Frota", role)).toBeDefined();
    },
  );

  it.each(["entregador", "user", null])(
    "esconde Configurações de Frota para %s",
    (role) => {
      expect(findItem("Configurações de Frota", role)).toBeUndefined();
    },
  );
});
