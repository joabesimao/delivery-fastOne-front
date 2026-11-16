import axios, {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { session } from "@/shared/session/session";

const createWindow = () => {
  const store = new Map<string, string>();
  return {
    location: { pathname: "/entregas", href: "" },
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  };
};

const failWith = (status: number) => (config: InternalAxiosRequestConfig) =>
  Promise.reject(
    new AxiosError("erro", undefined, config, null, {
      status,
      statusText: "",
      headers: {},
      config,
      data: {},
    }),
  );

const succeed = (config: InternalAxiosRequestConfig) =>
  Promise.resolve({
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    data: { ok: true },
  });

describe("httpClient", () => {
  beforeEach(() => {
    vi.stubGlobal("window", createWindow());
    session.start({
      accessToken: "access-antigo",
      refreshToken: "refresh-antigo",
      user: { email: "ana@fastone.com", name: "Ana", role: "user" },
    });
  });

  it("renova o token e repete a requisição no 401", async () => {
    const adapter = vi
      .fn<AxiosAdapter>()
      .mockImplementationOnce(failWith(401))
      .mockImplementationOnce(succeed);
    const post = vi.spyOn(axios, "post").mockResolvedValue({
      data: { accessToken: "access-novo", refreshToken: "refresh-novo" },
    });

    const response = await httpClient.get("/entregas", { adapter });

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      expect.stringMatching(/\/refresh-token$/),
      { refreshToken: "refresh-antigo" },
    );
    expect(adapter.mock.calls[1][0].headers.get("x-access-token")).toBe(
      "access-novo",
    );
    expect(session.getRefreshToken()).toBe("refresh-novo");
    expect(response.data).toEqual({ ok: true });
  });

  it("não renova o token no 403", async () => {
    const adapter = vi.fn<AxiosAdapter>(failWith(403));
    const post = vi.spyOn(axios, "post");

    await expect(httpClient.get("/cidades", { adapter })).rejects.toMatchObject(
      { response: { status: 403 } },
    );

    expect(post).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(session.getAccessToken()).toBe("access-antigo");
  });

  it("encerra a sessão quando o refresh falha", async () => {
    const adapter = vi.fn<AxiosAdapter>(failWith(401));
    const post = vi
      .spyOn(axios, "post")
      .mockRejectedValue(new Error("Too Many Requests"));

    await expect(
      httpClient.get("/entregas", { adapter }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(post).toHaveBeenCalledTimes(1);
    expect(session.getAccessToken()).toBeNull();
    expect(window.location.href).toBe("/");
  });
});
