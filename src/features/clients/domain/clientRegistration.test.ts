import { describe, expect, it } from "vitest";
import {
  emptyClientRegistrationForm,
  neighborhoodsOfCity,
  toClientRegistrationInput,
  validateClientRegistrationForm,
  type ClientRegistrationFormValues,
} from "./clientRegistration";

const VALID_CPF = "529.982.247-25";

const validValues = (
  overrides: Partial<ClientRegistrationFormValues> = {},
): ClientRegistrationFormValues => ({
  name: "Maria Silva",
  cpf: VALID_CPF,
  phone: "(81)98888-7777",
  address: {
    street: "Rua A",
    neighborhood: "Centro",
    numberHouse: "10",
    reference: "Perto",
    city: "Recife",
  },
  ...overrides,
});

describe("validateClientRegistrationForm", () => {
  it("formulário válido não tem erros", () => {
    expect(validateClientRegistrationForm(validValues())).toEqual({});
  });

  it("formulário vazio exige todos os campos obrigatórios", () => {
    expect(validateClientRegistrationForm(emptyClientRegistrationForm)).toEqual(
      {
        name: "Informe o nome completo.",
        cpf: "Informe o CPF.",
        phone: "Informe o telefone.",
        address: {
          street: "Informe a rua.",
          neighborhood: "Informe o bairro.",
          numberHouse: "Informe o número.",
          city: "Informe a cidade.",
        },
      },
    );
  });

  it("CPF é obrigatório e deve ser válido", () => {
    expect(
      validateClientRegistrationForm(validValues({ cpf: "123.456.789-00" }))
        .cpf,
    ).toMatch(/CPF inválido/);
  });

  it("telefone precisa ter 10 ou 11 dígitos", () => {
    expect(
      validateClientRegistrationForm(validValues({ phone: "12345" })).phone,
    ).toBe("Telefone inválido. Use DDD + número.");
    expect(
      validateClientRegistrationForm(validValues({ phone: "8133334444" }))
        .phone,
    ).toBeUndefined();
  });

  it("numberHouse vazio pede o número", () => {
    const errors = validateClientRegistrationForm(
      validValues({ address: { ...validValues().address, numberHouse: "" } }),
    );
    expect(errors.address?.numberHouse).toBe("Informe o número.");
  });

  it("numberHouse não numérico pede apenas números", () => {
    const errors = validateClientRegistrationForm(
      validValues({
        address: { ...validValues().address, numberHouse: "S/N" },
      }),
    );
    expect(errors.address?.numberHouse).toBe(
      "Informe apenas números (ex.: 120).",
    );
  });

  it("numberHouse numérico não gera erro", () => {
    const errors = validateClientRegistrationForm(
      validValues({
        address: { ...validValues().address, numberHouse: "120" },
      }),
    );
    expect(errors.address).toBeUndefined();
  });

  it("só inclui address nos erros quando algum campo falha", () => {
    const errors = validateClientRegistrationForm(
      validValues({
        address: { ...validValues().address, street: " ", reference: "" },
      }),
    );

    expect(errors.address).toEqual({ street: "Informe a rua." });
  });
});

describe("toClientRegistrationInput", () => {
  it("remove máscaras, aplica trim e converte o número", () => {
    expect(
      toClientRegistrationInput(
        validValues({
          name: "  Maria  ",
          address: {
            street: " Rua A ",
            neighborhood: "Centro",
            numberHouse: "10",
            reference: " Perto ",
            city: "Recife",
          },
        }),
      ),
    ).toEqual({
      client: { name: "Maria", cpf: "52998224725", phone: "81988887777" },
      address: {
        street: "Rua A",
        neighborhood: "Centro",
        numberHouse: 10,
        reference: "Perto",
        city: "Recife",
      },
    });
  });
});

describe("toClientRegistrationInput com espaços nas pontas", () => {
  it("aplica trim em todos os campos de texto, inclusive numberHouse", () => {
    expect(
      toClientRegistrationInput(
        validValues({
          name: "  Maria  ",
          address: {
            street: " Rua A ",
            neighborhood: "  Centro ",
            numberHouse: " 12 ",
            reference: " Perto ",
            city: " Recife  ",
          },
        }),
      ),
    ).toEqual({
      client: { name: "Maria", cpf: "52998224725", phone: "81988887777" },
      address: {
        street: "Rua A",
        neighborhood: "Centro",
        numberHouse: 12,
        reference: "Perto",
        city: "Recife",
      },
    });
  });
});

describe("neighborhoodsOfCity", () => {
  const cities = [
    { id: 1, name: "Recife" },
    { id: 2, name: "Olinda" },
  ];
  const neighborhoods = [
    { id: 1, name: "Boa Viagem", cityId: 1, cityName: "Recife" },
    { id: 2, name: "Carmo", cityId: 2, cityName: "Olinda" },
    { id: 3, name: "Pina", cityId: 1, cityName: "Recife" },
  ];

  it("filtra os bairros da cidade informada", () => {
    expect(
      neighborhoodsOfCity(cities, neighborhoods, "Recife").map((n) => n.id),
    ).toEqual([1, 3]);
  });

  it("retorna todos os bairros quando a cidade não existe", () => {
    expect(neighborhoodsOfCity(cities, neighborhoods, "")).toEqual(
      neighborhoods,
    );
    expect(neighborhoodsOfCity(cities, neighborhoods, "Paulista")).toEqual(
      neighborhoods,
    );
  });
});
