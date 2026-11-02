import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { extractApiErrorMessage } from "./extractApiErrorMessage";

const axiosError = (status: number, data?: unknown) =>
  new AxiosError("falha", "ERR", undefined, undefined, {
    status,
    data,
  } as AxiosResponse);

describe("extractApiErrorMessage", () => {
  it("junta errorMessages em array", () => {
    const error = axiosError(400, {
      errorMessages: ["Nome inválido", "CPF inválido"],
    });

    expect(extractApiErrorMessage(error)).toBe("Nome inválido, CPF inválido");
  });

  it("combina message e statusCode", () => {
    const error = axiosError(404, {
      message: "Não encontrado",
      statusCode: 404,
    });

    expect(extractApiErrorMessage(error)).toBe("Não encontrado, COD: 404");
  });

  it("ignora error igual a Bad Request", () => {
    const error = axiosError(400, {
      error: "Bad Request",
      message: "Campo obrigatório",
    });

    expect(extractApiErrorMessage(error)).toBe("Campo obrigatório");
  });

  it("usa o status quando a resposta não tem corpo", () => {
    expect(extractApiErrorMessage(axiosError(500))).toBe("Erro da API: 500");
  });

  it("usa a mensagem de um Error comum", () => {
    expect(extractApiErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("retorna a mensagem padrão para erro desconhecido", () => {
    expect(extractApiErrorMessage("x")).toBe(
      "Ocorreu um erro inesperado. Tente novamente.",
    );
    expect(extractApiErrorMessage(null, "padrão")).toBe("padrão");
  });

  it("remove mensagens duplicadas", () => {
    const error = axiosError(400, {
      message: ["Erro X", "Erro X"],
      errorMessage: "Erro X",
    });

    expect(extractApiErrorMessage(error)).toBe("Erro X");
  });
});
