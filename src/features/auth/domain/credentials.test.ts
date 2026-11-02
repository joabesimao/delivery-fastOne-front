import { describe, expect, it, vi } from "vitest";
import {
  LOGIN_MESSAGES,
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
    expect(validateCredentials({ login: "a", password: "" })).toBe(
      LOGIN_MESSAGES.required,
    );
  });

  it("aceita credenciais preenchidas", () => {
    expect(validateCredentials({ login: "a", password: "x" })).toBeNull();
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

describe("LOGIN_MESSAGES", () => {
  it("usa textos acentuados", () => {
    expect(LOGIN_MESSAGES.rejected).toBe(
      "Não foi possível autenticar com as credenciais informadas.",
    );
    expect(LOGIN_MESSAGES.invalid).toBe("Login ou senha inválidos.");
    expect(LOGIN_MESSAGES.unavailable).toBe(
      "Não foi possível conectar ao servidor. Tente novamente.",
    );
  });
});

describe("loginErrorMessage", () => {
  it("indisponível para status 500, com e sem corpo", () => {
    expect(loginErrorMessage({ response: { status: 500 } })).toBe(
      LOGIN_MESSAGES.unavailable,
    );
    expect(
      loginErrorMessage({
        response: { status: 500, data: { error: "Erro interno" } },
      }),
    ).toBe(LOGIN_MESSAGES.unavailable);
  });

  it("usa data.error em respostas 400", () => {
    expect(
      loginErrorMessage({ response: { status: 400, data: { error: "X" } } }),
    ).toBe("X");
  });

  it("prioriza data.error do backend", () => {
    expect(
      loginErrorMessage({
        response: { data: { error: "Bloqueado", message: "outra" } },
      }),
    ).toBe("Bloqueado");
  });

  it("usa data.message quando não há error", () => {
    expect(
      loginErrorMessage({
        response: { data: { message: "Credenciais ruins" } },
      }),
    ).toBe("Credenciais ruins");
  });

  it("devolve mensagem padrão com 401 sem corpo e indisponível sem resposta ou 5xx", () => {
    expect(loginErrorMessage({ response: { status: 401 } })).toBe(
      LOGIN_MESSAGES.invalid,
    );
    expect(loginErrorMessage(new Error("Network Error"))).toBe(
      LOGIN_MESSAGES.unavailable,
    );
    expect(loginErrorMessage(undefined)).toBe(LOGIN_MESSAGES.unavailable);
    expect(loginErrorMessage({ response: { status: 503 } })).toBe(
      LOGIN_MESSAGES.unavailable,
    );
  });
});
