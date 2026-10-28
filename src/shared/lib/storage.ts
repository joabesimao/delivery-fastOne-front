const attempt = <T>(action: () => T, fallback: T): T => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

export const storage = {
  get: (key: string): string | null =>
    attempt(() => window.localStorage.getItem(key), null),
  set: (key: string, value: string): void =>
    attempt(() => window.localStorage.setItem(key, value), undefined),
  remove: (key: string): void =>
    attempt(() => window.localStorage.removeItem(key), undefined),
};
