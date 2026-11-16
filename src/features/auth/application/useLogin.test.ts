import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { session } from "@/shared/session/session";
import { authRepository } from "../data/authRepository";
import { LOGIN_MESSAGES } from "../domain/credentials";
import { useLogin } from "./useLogin";

vi.mock("../data/authRepository", () => ({
  authRepository: { login: vi.fn() },
}));

vi.mock("@/shared/session/session", () => ({
  session: { start: vi.fn() },
}));

describe("useLogin", () => {
  const onAuthenticated = vi.fn();

  beforeEach(() => {
    vi.mocked(authRepository.login).mockResolvedValue({
      accessToken: "tok",
      refreshToken: "ref",
      name: "Admin",
      role: "admin",
    });
  });

  const setup = () => renderHook(() => useLogin(onAuthenticated));

  it("rejeita credenciais vazias sem chamar a API", async () => {
    const { result } = setup();
    await act(() => result.current.login({ login: " ", password: "" }));
    expect(result.current.error).toBe(LOGIN_MESSAGES.required);
    expect(authRepository.login).not.toHaveBeenCalled();
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it("autentica, inicia a sessão e notifica", async () => {
    const { result } = setup();
    await act(() =>
      result.current.login({ login: " user@x.com ", password: "123" }),
    );
    expect(authRepository.login).toHaveBeenCalledWith("user@x.com", "123");
    expect(session.start).toHaveBeenCalledWith({
      accessToken: "tok",
      refreshToken: "ref",
      user: { email: "user@x.com", name: "Admin", role: "admin" },
    });
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("converte o login admin para o e-mail técnico", async () => {
    const { result } = setup();
    await act(() => result.current.login({ login: "Admin", password: "123" }));
    expect(authRepository.login).toHaveBeenCalledWith(
      "admin@fastone.local",
      "123",
    );
  });

  it("mostra erro quando a resposta não traz token", async () => {
    vi.mocked(authRepository.login).mockResolvedValue({});
    const { result } = setup();
    await act(() => result.current.login({ login: "a@b.c", password: "1" }));
    expect(result.current.error).toBe(LOGIN_MESSAGES.rejected);
    expect(session.start).not.toHaveBeenCalled();
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("bloqueia o entregador no web sem iniciar a sessão", async () => {
    vi.mocked(authRepository.login).mockResolvedValue({
      accessToken: "tok",
      refreshToken: "ref",
      name: "João",
      role: "entregador",
    });
    const { result } = setup();
    await act(() =>
      result.current.login({ login: "joao@x.com", password: "1" }),
    );
    expect(result.current.error).toBe(LOGIN_MESSAGES.deliverymanUseApp);
    expect(session.start).not.toHaveBeenCalled();
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("rejeita login que não é e-mail sem chamar a API", async () => {
    const { result } = setup();
    await act(() => result.current.login({ login: "joao", password: "1" }));
    expect(result.current.error).toBe(LOGIN_MESSAGES.invalidEmail);
    expect(authRepository.login).not.toHaveBeenCalled();
  });

  it("mostra mensagem amigável em credenciais incorretas", async () => {
    vi.mocked(authRepository.login).mockRejectedValue({
      response: { status: 401, data: { error: "E-mail ou senha incorretos." } },
    });
    const { result } = setup();
    await act(() => result.current.login({ login: "a@b.c", password: "1" }));
    expect(result.current.error).toBe(LOGIN_MESSAGES.invalid);
    expect(result.current.loading).toBe(false);
  });

  it("mostra falta de conexão em erro de rede", async () => {
    vi.mocked(authRepository.login).mockRejectedValue(new Error("network"));
    const { result } = setup();
    await act(() => result.current.login({ login: "a@b.c", password: "1" }));
    expect(result.current.error).toBe(LOGIN_MESSAGES.offline);
  });

  it("mostra instabilidade em erro 5xx", async () => {
    vi.mocked(authRepository.login).mockRejectedValue({
      response: { status: 502 },
    });
    const { result } = setup();
    await act(() => result.current.login({ login: "a@b.c", password: "1" }));
    expect(result.current.error).toBe(LOGIN_MESSAGES.unavailable);
  });

  it("limpa o erro anterior em uma nova tentativa", async () => {
    const { result } = setup();
    await act(() => result.current.login({ login: "", password: "" }));
    expect(result.current.error).not.toBe("");
    await act(() => result.current.login({ login: "a@b.c", password: "1" }));
    expect(result.current.error).toBe("");
  });
});
