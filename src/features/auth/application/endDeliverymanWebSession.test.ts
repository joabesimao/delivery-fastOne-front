import { beforeEach, describe, expect, it, vi } from "vitest";
import { session } from "@/shared/session/session";
import { endDeliverymanWebSession } from "./endDeliverymanWebSession";

vi.mock("@/shared/session/session", () => ({
  session: { getUser: vi.fn(), clear: vi.fn() },
}));

const withRole = (role: string | null) =>
  vi.mocked(session.getUser).mockReturnValue({ email: "", name: "", role });

describe("endDeliverymanWebSession", () => {
  beforeEach(() => vi.mocked(session.clear).mockClear());

  it("encerra a sessão de entregador já logado", () => {
    withRole("entregador");
    expect(endDeliverymanWebSession()).toBe(true);
    expect(session.clear).toHaveBeenCalledOnce();
  });

  it.each(["admin", "gerente_estoque", "user", null])(
    "mantém a sessão do papel %s",
    (role) => {
      withRole(role);
      expect(endDeliverymanWebSession()).toBe(false);
      expect(session.clear).not.toHaveBeenCalled();
    },
  );
});
