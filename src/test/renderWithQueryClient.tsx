import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

interface RenderOptions {
  route?: string;
  withRouter?: boolean;
}

export const renderHookWithQueryClient = <TResult, TProps = undefined>(
  hook: (props: TProps) => TResult,
  { route = "/", withRouter = false }: RenderOptions = {},
  initialProps?: TProps,
) => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => {
    const content = (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return withRouter ? (
      <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
    ) : (
      content
    );
  };
  const rendered = renderHook(hook, { wrapper, initialProps });
  return { ...rendered, queryClient };
};

export const renderHookWithRouter = <TResult,>(
  hook: () => TResult,
  route = "/",
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return renderHook(hook, { wrapper });
};
