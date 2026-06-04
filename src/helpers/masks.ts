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