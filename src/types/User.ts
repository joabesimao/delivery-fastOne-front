export type UserRole = "admin" | "gerente_estoque" | "entregador" | "user";

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  unitStoreId?: number | null;
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gerente_estoque", label: "Gerente de Estoque" },
  { value: "entregador", label: "Entregador" },
  { value: "user", label: "Usuário" },
];
