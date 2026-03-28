import type { ReactNode } from "react";

export type WithChildren<T = object> = T & {
  children: ReactNode;
};