export type UsuarioRole = "admin" | "gerente_estoque" | "entregador" | "user";

export interface UsuarioItem {
  id: number;
  name: string;
  email: string;
  role: UsuarioRole;
  active: boolean;
  unitStoreId?: number | null;
}

export const ROLE_OPTIONS: { value: UsuarioRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gerente_estoque", label: "Gerente de Estoque" },
  { value: "entregador", label: "Entregador" },
  { value: "user", label: "Usuário" },
];
