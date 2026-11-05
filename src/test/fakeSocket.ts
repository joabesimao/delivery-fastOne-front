import { vi } from "vitest";

type Handler = (...args: unknown[]) => void;

export const createFakeSocket = () => {
  const handlers = new Map<string, Set<Handler>>();
  return {
    on: vi.fn((event: string, handler: Handler) => {
      const set = handlers.get(event) ?? new Set<Handler>();
      set.add(handler);
      handlers.set(event, set);
    }),
    off: vi.fn((event: string, handler: Handler) => {
      handlers.get(event)?.delete(handler);
    }),
    emit: (event: string, ...args: unknown[]) =>
      handlers.get(event)?.forEach((handler) => handler(...args)),
    listenerCount: (event: string) => handlers.get(event)?.size ?? 0,
  };
};
