import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CityTable from "./CityTable";

const cities = [{ id: 1, name: "Fortaleza" }];

const renderTable = (onDelete?: (city: (typeof cities)[number]) => void) =>
  render(
    <CityTable
      cities={cities}
      loading={false}
      error={null}
      busyCityId={null}
      onEdit={vi.fn()}
      onDelete={onDelete}
    />,
  );

describe("CityTable", () => {
  it("repassa a cidade para onDelete", () => {
    const onDelete = vi.fn();
    renderTable(onDelete);

    fireEvent.click(screen.getByRole("button", { name: "Deletar" }));

    expect(onDelete).toHaveBeenCalledWith(cities[0]);
  });

  it("esconde deletar quando a página não permite excluir", () => {
    renderTable();

    expect(screen.getByRole("button", { name: "Editar" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Deletar" })).toBeNull();
  });
});
