import { describe, expect, it } from "vitest";
import { avatarLabelOf, displayEmailOf, displayNameOf } from "./currentUser";

const user = (name: string, email: string) => ({
  name,
  email,
  role: "user",
});

describe("displayNameOf", () => {
  it("prefere o nome", () => {
    expect(displayNameOf(user("Maria", "m@x.com"))).toBe("Maria");
  });

  it("sem nome, usa o e-mail", () => {
    expect(displayNameOf(user("", " m@x.com "))).toBe("m@x.com");
  });

  it("e-mail técnico do admin vira o nome padrão", () => {
    expect(displayNameOf(user("", "ADMIN@fastone.local"))).toBe(
      "Operador Admin",
    );
  });

  it("sem nome nem e-mail, usa o nome padrão", () => {
    expect(displayNameOf(user("", "  "))).toBe("Operador Admin");
  });
});

describe("displayEmailOf", () => {
  it("devolve o e-mail ou o padrão", () => {
    expect(displayEmailOf(user("A", "a@x.com"))).toBe("a@x.com");
    expect(displayEmailOf(user("A", ""))).toBe("carlos@delivery.com");
  });
});

describe("avatarLabelOf", () => {
  it("usa as iniciais das duas primeiras palavras em maiúsculas", () => {
    expect(avatarLabelOf("maria da silva")).toBe("MD");
    expect(avatarLabelOf("  ana  ")).toBe("A");
  });

  it("devolve U para nome vazio", () => {
    expect(avatarLabelOf("   ")).toBe("U");
  });
});
