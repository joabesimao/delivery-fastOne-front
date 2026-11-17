import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RowActions from "./RowActions";

describe("RowActions", () => {
  it("mostra editar e deletar quando recebe os dois handlers", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<RowActions onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Deletar" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("esconde deletar sem onDelete", () => {
    render(<RowActions onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Editar" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Deletar" })).toBeNull();
  });

  it("mostra só visualizar sem onEdit e onDelete", () => {
    render(<RowActions onView={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Visualizar" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Deletar" })).toBeNull();
  });
});
