const MAX_HOUSE_NUMBER = 2147483647;

export const isValidHouseNumber = (value: string): boolean =>
  /^\d+$/.test(value.trim()) && Number(value) <= MAX_HOUSE_NUMBER;
