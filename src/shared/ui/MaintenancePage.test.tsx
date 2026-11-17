import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MaintenancePage from "./MaintenancePage";

describe("MaintenancePage", () => {
  it("avisa que o módulo informado está em manutenção", () => {
    render(<MaintenancePage moduleName="Produtos" />);

    expect(
      screen.getByRole("heading", { name: "Módulo Produtos em manutenção" }),
    ).toBeTruthy();
    expect(screen.getByText(/temporariamente indisponível/i)).toBeTruthy();
  });
});
