import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RouteTabs from "./RouteTabs";

const TABS = [
  { label: "Cidades", path: "/cidades" },
  { label: "Bairros", path: "/bairros" },
];

const CurrentPath = () => (
  <span data-testid="path">{useLocation().pathname}</span>
);

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <RouteTabs tabs={TABS} />
              <CurrentPath />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("RouteTabs", () => {
  it("marca a aba da rota atual", () => {
    renderAt("/bairros");
    expect(
      screen
        .getByRole("tab", { name: "Bairros" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("marca a primeira aba quando a rota não corresponde a nenhuma", () => {
    renderAt("/outra");
    expect(
      screen
        .getByRole("tab", { name: "Cidades" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("navega para a rota da aba clicada", () => {
    renderAt("/cidades");
    fireEvent.click(screen.getByRole("tab", { name: "Bairros" }));
    expect(screen.getByTestId("path").textContent).toBe("/bairros");
  });
});
