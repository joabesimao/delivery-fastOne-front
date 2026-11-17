import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductItemActions from "./ProductItemActions";

describe("ProductItemActions", () => {
  it("mostra editar e excluir quando recebe onDelete", () => {
    render(
      <ProductItemActions busy={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Editar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeTruthy();
  });

  it("esconde excluir sem onDelete", () => {
    render(<ProductItemActions busy={false} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Editar" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
  });
});
