export const stripPhone = (value: string = "") => value.replace(/\D/g, "").slice(0, 11);

export const phoneMask = (value: string = "") => {
  const digits = stripPhone(value);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const isValidPhone = (value: string = "") => {
  const digits = stripPhone(value);
  return digits.length === 10 || digits.length === 11;
};

export const stripCPF = (value: string = "") => value.replace(/\D/g, "").slice(0, 11);

export const cpfMask = (value: string = "") => {
  const digits = stripCPF(value);

  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const isValidCPF = (value: string = ""): boolean => {
  const digits = stripCPF(value);

  // Verificar se tem exatamente 11 dígitos
  if (digits.length !== 11 || !/^\d+$/.test(digits)) {
    return false;
  }

  // Rejeitar sequências repetidas (111.111.111-11, 222.222.222-22, etc)
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Validar dígitos verificadores
  return (
    parseInt(digits[9]) === firstDigit &&
    parseInt(digits[10]) === secondDigit
  );
};

export const currencyInputMask = (value: string = "") => {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) return "";

  const normalizedDigits = digitsOnly.replace(/^0+(?=\d)/, "") || "0";
  const centsPadded = normalizedDigits.padStart(3, "0");
  const integerPart = centsPadded.slice(0, -2);
  const decimalPart = centsPadded.slice(-2);
  const integerWithThousand = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${integerWithThousand},${decimalPart}`;
};

export const parseCurrencyToNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (value === null || value === undefined) {
    return Number.NaN;
  }

  const raw = String(value).trim();
  if (!raw) {
    return Number.NaN;
  }

  const sanitized = raw.replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");

  let normalized = sanitized;

  if (hasComma && hasDot) {
    const commaIsDecimal = sanitized.lastIndexOf(",") > sanitized.lastIndexOf(".");
    normalized = commaIsDecimal
      ? sanitized.replace(/\./g, "").replace(",", ".")
      : sanitized.replace(/,/g, "");
  } else if (hasComma) {
    normalized = sanitized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};

export const formatCurrencyFromNumber = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};