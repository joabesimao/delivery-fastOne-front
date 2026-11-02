import { describe, expect, it } from "vitest";
import {
  collectRegisteredDocuments,
  deliverymanFullName,
  emptyDeliverymanForm,
  filterDeliverymen,
  toDeliverymanFormValues,
  toDeliverymanInput,
  validateDeliverymanForm,
  type Deliveryman,
  type DeliverymanFormValues,
  type RegisteredDocuments,
} from "./deliveryman";

const VALID_CPF = "529.982.247-25";
const OTHER_VALID_CPF = "111.444.777-35";

const person = (overrides: Partial<Deliveryman> = {}): Deliveryman => ({
  id: 1,
  name: "João",
  lastName: "Silva",
  phone: "11999998888",
  cpf: "52998224725",
  numberQualification: "ABC123",
  ...overrides,
});

const form = (
  overrides: Partial<DeliverymanFormValues> = {},
): DeliverymanFormValues => ({
  name: "João",
  lastName: "Silva",
  phone: "(11)99999-8888",
  cpf: VALID_CPF,
  numberQualification: "ABC123",
  ...overrides,
});

const noneRegistered = (): RegisteredDocuments => ({
  cpfs: new Set(),
  qualifications: new Set(),
});

describe("deliverymanFullName", () => {
  it("junta nome e sobrenome", () => {
    expect(deliverymanFullName({ id: 1, name: "Ana", lastName: "Lima" })).toBe(
      "Ana Lima",
    );
  });
});

describe("toDeliverymanFormValues", () => {
  it("aplica máscara de telefone e CPF", () => {
    expect(toDeliverymanFormValues(person())).toEqual({
      name: "João",
      lastName: "Silva",
      phone: "(11)99999-8888",
      cpf: "529.982.247-25",
      numberQualification: "ABC123",
    });
  });

  it("usa CPF vazio quando o entregador não tem CPF", () => {
    expect(toDeliverymanFormValues(person({ cpf: null })).cpf).toBe("");
  });
});

describe("collectRegisteredDocuments", () => {
  const list = [
    person({ id: 1, cpf: "52998224725", numberQualification: "A1" }),
    person({ id: 2, cpf: "111.444.777-35", numberQualification: "B2" }),
    person({ id: 3, cpf: null, numberQualification: "" }),
    person({ id: 4, cpf: "123", numberQualification: "C3" }),
  ];

  it("coleta CPFs completos normalizados e habilitações preenchidas", () => {
    const result = collectRegisteredDocuments(list);

    expect([...result.cpfs]).toEqual(["52998224725", "11144477735"]);
    expect([...result.qualifications]).toEqual(["A1", "B2", "C3"]);
  });

  it("ignora o entregador excluído (edição)", () => {
    const result = collectRegisteredDocuments(list, 1);

    expect(result.cpfs.has("52998224725")).toBe(false);
    expect(result.qualifications.has("A1")).toBe(false);
    expect(result.cpfs.has("11144477735")).toBe(true);
  });
});

describe("filterDeliverymen", () => {
  const list = [
    person({ id: 1, name: "João", lastName: "Silva", phone: "11999998888" }),
    person({ id: 2, name: "Maria", lastName: "Souza", phone: "21988887777" }),
  ];

  it("sem filtros devolve todos", () => {
    expect(filterDeliverymen(list, { name: "", phone: "" })).toHaveLength(2);
  });

  it("filtra por nome completo ignorando caixa e espaços", () => {
    expect(
      filterDeliverymen(list, { name: "  joão sil ", phone: "" }).map(
        (d) => d.id,
      ),
    ).toEqual([1]);
  });

  it("filtra por telefone ignorando a máscara", () => {
    expect(
      filterDeliverymen(list, { name: "", phone: "(21) 98888" }).map(
        (d) => d.id,
      ),
    ).toEqual([2]);
  });

  it("combina nome e telefone", () => {
    expect(filterDeliverymen(list, { name: "maria", phone: "11999" })).toEqual(
      [],
    );
  });
});

describe("validateDeliverymanForm", () => {
  it("aceita um formulário válido", () => {
    expect(validateDeliverymanForm(form(), noneRegistered())).toEqual({});
  });

  it("exige todos os campos quando vazio", () => {
    expect(
      validateDeliverymanForm(emptyDeliverymanForm, noneRegistered()),
    ).toEqual({
      name: "Informe o nome.",
      lastName: "Informe o sobrenome.",
      phone: "Informe o telefone.",
      cpf: "Informe o CPF.",
      numberQualification: "Informe o número da habilitação.",
    });
  });

  it("trata espaços em branco como vazio", () => {
    const errors = validateDeliverymanForm(
      form({ name: "  ", lastName: " " }),
      noneRegistered(),
    );

    expect(errors.name).toBe("Informe o nome.");
    expect(errors.lastName).toBe("Informe o sobrenome.");
  });

  it("rejeita telefone com menos de 10 dígitos", () => {
    expect(
      validateDeliverymanForm(form({ phone: "1199" }), noneRegistered()).phone,
    ).toBe("Telefone inválido. Use DDD + número.");
  });

  it("rejeita CPF inválido", () => {
    expect(
      validateDeliverymanForm(form({ cpf: "111.111.111-11" }), noneRegistered())
        .cpf,
    ).toMatch(/^CPF inválido/);
  });

  it("rejeita CPF já cadastrado, mesmo com máscara diferente", () => {
    const registered = {
      ...noneRegistered(),
      cpfs: new Set(["52998224725"]),
    };

    expect(validateDeliverymanForm(form(), registered).cpf).toBe(
      "Este CPF já está cadastrado no sistema.",
    );
    expect(
      validateDeliverymanForm(form({ cpf: OTHER_VALID_CPF }), registered).cpf,
    ).toBeUndefined();
  });

  it("rejeita habilitação já cadastrada", () => {
    const registered = {
      ...noneRegistered(),
      qualifications: new Set(["ABC123"]),
    };

    expect(
      validateDeliverymanForm(form(), registered).numberQualification,
    ).toBe("Esta habilitação já está cadastrada no sistema.");
  });

  describe("requireCpf = false", () => {
    it("permite CPF vazio", () => {
      expect(
        validateDeliverymanForm(form({ cpf: "" }), noneRegistered(), {
          requireCpf: false,
        }),
      ).toEqual({});
    });

    it("ainda valida CPF informado", () => {
      expect(
        validateDeliverymanForm(form({ cpf: "123" }), noneRegistered(), {
          requireCpf: false,
        }).cpf,
      ).toMatch(/^CPF inválido/);
    });
  });
});

describe("toDeliverymanInput", () => {
  it("remove máscaras e espaços", () => {
    expect(
      toDeliverymanInput(form({ name: " João ", lastName: " Silva " })),
    ).toEqual({
      name: "João",
      lastName: "Silva",
      phone: "11999998888",
      cpf: "52998224725",
      numberQualification: "ABC123",
    });
  });

  it("envia cpf undefined quando vazio", () => {
    expect(toDeliverymanInput(form({ cpf: "" })).cpf).toBeUndefined();
  });
});
