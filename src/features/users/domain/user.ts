import type { FormikErrors } from "formik";

export type UserRole = "admin" | "gerente_estoque" | "entregador" | "user";

export interface User {
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

export interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
  resetPassword: boolean;
  password: string;
  passwordConfirmation: string;
}

export interface UserPasswordInput {
  password: string;
  passwordConfirmation: string;
}

export interface UserInput extends Partial<UserPasswordInput> {
  name: string;
  email: string;
  role: UserRole;
}

export const MIN_PASSWORD_LENGTH = 6;

export const toUserFormValues = (user?: User | null): UserFormValues => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  role: user?.role ?? "user",
  resetPassword: !user,
  password: "",
  passwordConfirmation: "",
});

export const validateUserForm = (
  values: UserFormValues,
): FormikErrors<UserFormValues> => {
  const errors: FormikErrors<UserFormValues> = {};
  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!values.email.trim()) errors.email = "Informe o e-mail.";

  if (values.resetPassword) {
    if (!values.password) errors.password = "Informe a senha.";
    else if (values.password.length < MIN_PASSWORD_LENGTH)
      errors.password = `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;

    if (!values.passwordConfirmation)
      errors.passwordConfirmation = "Confirme a senha.";
    else if (values.password !== values.passwordConfirmation)
      errors.passwordConfirmation = "As senhas não coincidem.";
  }

  return errors;
};

export const toUserInput = (values: UserFormValues): UserInput => ({
  name: values.name.trim(),
  email: values.email.trim(),
  role: values.role,
  ...(values.resetPassword && {
    password: values.password,
    passwordConfirmation: values.passwordConfirmation,
  }),
});

export type UserRoleFilter = UserRole | "all";

export interface UserListFilters {
  search: string;
  role: UserRoleFilter;
}

export const ROLE_FILTER_OPTIONS: { value: UserRoleFilter; label: string }[] = [
  { value: "all", label: "Todos os papéis" },
  ...ROLE_OPTIONS,
];

export const toUserListParams = ({
  search,
  role,
}: UserListFilters): Record<string, string> => ({
  ...(search ? { q: search } : {}),
  ...(role !== "all" ? { role } : {}),
});
