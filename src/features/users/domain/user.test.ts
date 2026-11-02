import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  toUserFormValues,
  toUserInput,
  toUserListParams,
  validateUserForm,
  type User,
  type UserFormValues,
} from "./user";

const baseValues: UserFormValues = {
  name: "Maria",
  email: "maria@x.com",
  role: "admin",
  resetPassword: false,
  password: "",
  passwordConfirmation: "",
};

describe("toUserFormValues", () => {
  it("sem usuário, devolve valores de criação com senha obrigatória", () => {
    expect(toUserFormValues()).toEqual({
      name: "",
      email: "",
      role: "user",
      resetPassword: true,
      password: "",
      passwordConfirmation: "",
    });
  });

  it("com usuário, preenche os dados e não exige senha", () => {
    const user: User = {
      id: 1,
      name: "Ana",
      email: "ana@x.com",
      role: "entregador",
      active: true,
    };
    expect(toUserFormValues(user)).toMatchObject({
      name: "Ana",
      email: "ana@x.com",
      role: "entregador",
      resetPassword: false,
    });
  });
});

describe("validateUserForm", () => {
  it("exige nome e e-mail, ignorando espaços", () => {
    const errors = validateUserForm({ ...baseValues, name: "  ", email: " " });
    expect(errors.name).toBe("Informe o nome.");
    expect(errors.email).toBe("Informe o e-mail.");
  });

  it("na edição sem troca de senha, não valida senha", () => {
    expect(validateUserForm(baseValues)).toEqual({});
  });

  it("na criação exige senha e confirmação", () => {
    const errors = validateUserForm({ ...baseValues, resetPassword: true });
    expect(errors.password).toBe("Informe a senha.");
    expect(errors.passwordConfirmation).toBe("Confirme a senha.");
  });

  it("rejeita senha menor que o mínimo e aceita no limite", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    const exact = "a".repeat(MIN_PASSWORD_LENGTH);
    expect(
      validateUserForm({
        ...baseValues,
        resetPassword: true,
        password: short,
        passwordConfirmation: short,
      }).password,
    ).toContain(String(MIN_PASSWORD_LENGTH));
    expect(
      validateUserForm({
        ...baseValues,
        resetPassword: true,
        password: exact,
        passwordConfirmation: exact,
      }),
    ).toEqual({});
  });

  it("detecta confirmação diferente", () => {
    const errors = validateUserForm({
      ...baseValues,
      resetPassword: true,
      password: "123456",
      passwordConfirmation: "654321",
    });
    expect(errors.passwordConfirmation).toBe("As senhas não coincidem.");
    expect(errors.password).toBeUndefined();
  });
});

describe("toUserInput", () => {
  it("na edição sem troca de senha, omite as senhas e faz trim", () => {
    const input = toUserInput({
      ...baseValues,
      name: " Maria ",
      email: " maria@x.com ",
      password: "ignorada",
    });
    expect(input).toEqual({
      name: "Maria",
      email: "maria@x.com",
      role: "admin",
    });
    expect(input).not.toHaveProperty("password");
    expect(input).not.toHaveProperty("passwordConfirmation");
  });

  it("com resetPassword, inclui senha e confirmação", () => {
    expect(
      toUserInput({
        ...baseValues,
        resetPassword: true,
        password: "123456",
        passwordConfirmation: "123456",
      }),
    ).toEqual({
      name: "Maria",
      email: "maria@x.com",
      role: "admin",
      password: "123456",
      passwordConfirmation: "123456",
    });
  });
});

describe("toUserListParams", () => {
  it("sem filtros devolve objeto vazio", () => {
    expect(toUserListParams({ search: "", role: "all" })).toEqual({});
  });

  it("inclui apenas os filtros preenchidos", () => {
    expect(toUserListParams({ search: "ana", role: "all" })).toEqual({
      q: "ana",
    });
    expect(toUserListParams({ search: "", role: "entregador" })).toEqual({
      role: "entregador",
    });
    expect(toUserListParams({ search: "ana", role: "admin" })).toEqual({
      q: "ana",
      role: "admin",
    });
  });
});
