import axios from "axios";

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

  const tryExtractFromData = (data: any) => {
    if (!data) return;

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
    tryExtractFromData((error as any).response?.data || error);
  }

  if (
    collected.length === 0 &&
    error &&
    typeof error === "object" &&
    typeof (error as any).message === "string"
  ) {
    pushText((error as any).message);
  }

  return collected.length ? collected.join(", ") : defaultMessage;
}
