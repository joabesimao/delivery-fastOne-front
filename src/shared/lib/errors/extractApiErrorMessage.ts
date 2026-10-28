import axios from "axios";

type ApiErrorBody = Partial<
  Record<
    "errorMessages" | "errorMessage" | "message" | "errors" | "error" | "statusCode" | "detail",
    unknown
  >
>;

export function extractApiErrorMessage(
  error: unknown,
  defaultMessage: string = "Ocorreu um erro inesperado. Tente novamente.",
): string {
  const collected: string[] = [];

  const pushText = (v: unknown) => {
    if (!v && v !== 0) return;
    if (Array.isArray(v)) {
      v.forEach(pushText);
      return;
    }
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed && !collected.includes(trimmed)) collected.push(trimmed);
      return;
    }
    if (typeof v === "number" || typeof v === "boolean") {
      const s = String(v);
      if (!collected.includes(s)) collected.push(s);
      return;
    }
    if (typeof v === "object") {
      Object.values(v as Record<string, unknown>).forEach(pushText);
    }
  };

  const tryExtractFromData = (body: unknown) => {
    if (!body || typeof body !== "object") return;
    const data = body as ApiErrorBody;

    if (data.errorMessages !== undefined && data.errorMessages !== null) {
      pushText(data.errorMessages);
    }
    if (data.errorMessage !== undefined && data.errorMessage !== null) {
      pushText(data.errorMessage);
    }

    if (data.message !== undefined && data.message !== null) {
      pushText(data.message);
    }

    if (data.errors) pushText(data.errors);
    if (data.error && data.error !== "Bad Request") pushText(data.error);
    if (data.statusCode) pushText(`COD: ${data.statusCode}`);
    if (data.detail) pushText(data.detail);
  };

  if (axios.isAxiosError(error)) {
    tryExtractFromData(error.response?.data);
    if (!collected.length && error.response?.status) {
      pushText(`Erro da API: ${error.response.status}`);
    }
  } else if (typeof error === "object" && error !== null) {
    const { response } = error as { response?: { data?: unknown } };
    tryExtractFromData(response?.data || error);
  }

  if (collected.length === 0 && error instanceof Error) {
    pushText(error.message);
  }

  return collected.length ? collected.join(", ") : defaultMessage;
}
