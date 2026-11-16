import { describe, expect, it, vi } from "vitest";
import {
  LOGIN_MESSAGES,
  isDeliveryman,
  loginErrorMessage,
  toLoginEmail,
  toSessionData,
  validateCredentials,
} from "./credentials";

describe("validateCredentials", () => {
  it("rejeita login ou senha vazios", () => {
    expect(validateCredentials({ login: "", password: "x" })).toBe(
      LOGIN_MESSAGES.required,
    );
    expect(validateCredentials({ login: "   ", password: "x" })).toBe(
      LOGIN_MESSAGES.required,
    );
    expect(validateCredentials({ login: "a@b.com", password: "" })).toBe(
      LOGIN_MESSAGES.required,
    );
  });

  it("rejeita login que não é e-mail", () => {
    for (const login of ["joao", "joao@", "joao@empresa", "jo ao@x.com"]) {
      expect(validateCredentials({ login, password: "x" })).toBe(
        LOGIN_MESSAGES.invalidEmail,
      );
    }
  });

  it("aceita e-mail válido, com espaços nas pontas", () => {
    expect(
      validateCredentials({ login: " maria@empresa.com ", password: "x" }),
    ).toBeNull();
  });

  it("aceita o login admin em qualquer caixa", () => {
    expect(validateCredentials({ login: " Admin ", password: "x" })).toBeNull();
  });
});

describe("toLoginEmail", () => {
  it("converte admin (qualquer caixa) para o e-mail técnico", () => {
    expect(toLoginEmail("admin")).toBe("admin@fastone.local");
    expect(toLoginEmail("  ADMIN ")).toBe("admin@fastone.local");
  });

  it("mantém outros logins, apenas com trim", () => {
    expect(toLoginEmail("  Maria@X.com ")).toBe("Maria@X.com");
  });
});

describe("toSessionData", () => {
  it("monta a sessão com os dados retornados", () => {
    expect(
      toSessionData(
        "maria@x.com",
        {
          accessToken: "tok",
          refreshToken: "ref",
          name: "Maria",
          role: "admin",
        },
        1000,
      ),
    ).toEqual({
      accessToken: "tok",
      refreshToken: "ref",
      user: { email: "maria@x.com", name: "Maria", role: "admin" },
    });
  });

  it("usa fallbacks para refresh token, nome e papel", () => {
    expect(toSessionData("maria@x.com", { accessToken: "tok" }, 1234)).toEqual({
      accessToken: "tok",
      refreshToken: "static-refresh-1234",
      user: { email: "maria@x.com", name: "maria@x.com", role: "user" },
    });
  });

  it("normaliza o rótulo do admin técnico", () => {
    const session = toSessionData(
      "admin@fastone.local",
      { accessToken: "tok" },
      1,
    );
    expect(session.user.email).toBe("admin");
    expect(session.user.name).toBe("admin");
  });

  it("usa Date.now quando now não é informado", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));
    const session = toSessionData("a", { accessToken: "t" });
    vi.useRealTimers();
    expect(session.refreshToken).toBe(
      `static-refresh-${Date.parse("2024-05-10T12:00:00Z")}`,
    );
  });
});

describe("isDeliveryman", () => {
  it("identifica o perfil entregador", () => {
    expect(isDeliveryman("entregador")).toBe(true);
  });

  it("não bloqueia os demais perfis nem papel ausente", () => {
    for (const role of ["admin", "gerente_estoque", "user", undefined]) {
      expect(isDeliveryman(role)).toBe(false);
    }
  });
});

describe("LOGIN_MESSAGES", () => {
  it("usa textos acentuados", () => {
    expect(LOGIN_MESSAGES.invalid).toBe(
      "E-mail ou senha incorretos. Confira os dados e tente novamente.",
    );
    expect(LOGIN_MESSAGES.rejected).toBe(
      "Não foi possível entrar. Tente novamente.",
    );
  });
});

describe("loginErrorMessage", () => {
  const withStatus = (status: number, data?: unknown) => ({
    response: { status, data },
  });

  it("credenciais incorretas em 401", () => {
    expect(loginErrorMessage(withStatus(401))).toBe(LOGIN_MESSAGES.invalid);
  });

  it("e-mail inválido em 400", () => {
    expect(loginErrorMessage(withStatus(400))).toBe(
      LOGIN_MESSAGES.invalidEmail,
    );
  });

  it("muitas tentativas em 429", () => {
    expect(loginErrorMessage(withStatus(429))).toBe(
      LOGIN_MESSAGES.tooManyAttempts,
    );
  });

  it("instabilidade em qualquer 5xx", () => {
    expect(loginErrorMessage(withStatus(500))).toBe(LOGIN_MESSAGES.unavailable);
    expect(loginErrorMessage(withStatus(503))).toBe(LOGIN_MESSAGES.unavailable);
  });

  it("sem conexão quando não há resposta do servidor", () => {
    expect(loginErrorMessage(new Error("Network Error"))).toBe(
      LOGIN_MESSAGES.offline,
    );
    expect(loginErrorMessage(undefined)).toBe(LOGIN_MESSAGES.offline);
  });

  it("mensagem genérica para status não mapeado", () => {
    expect(loginErrorMessage(withStatus(403))).toBe(LOGIN_MESSAGES.rejected);
    expect(loginErrorMessage(withStatus(404))).toBe(LOGIN_MESSAGES.rejected);
  });

  it("nunca repassa o texto técnico do backend", () => {
    expect(loginErrorMessage(withStatus(401, { error: "Unauthorized" }))).toBe(
      LOGIN_MESSAGES.invalid,
    );
    expect(
      loginErrorMessage(withStatus(400, { error: "Invalid param: email" })),
    ).toBe(LOGIN_MESSAGES.invalidEmail);
    expect(
      loginErrorMessage(withStatus(500, { error: "Internal server error" })),
    ).toBe(LOGIN_MESSAGES.unavailable);
  });
});
