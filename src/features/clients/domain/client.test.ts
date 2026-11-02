import { describe, expect, it } from "vitest";
import {
  ALL_CLIENTS,
  citiesOfClients,
  emptyClientFilters,
  filterClients,
  hasClientFilters,
  toClientEditFormValues,
  toClientUpdateInput,
  validateClientEditForm,
  type Client,
  type ClientEditFormValues,
} from "./client";

const VALID_CPF = "529.982.247-25";

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 1,
  name: "Maria Silva",
  cpf: null,
  phone: "81988887777",
  active: true,
  registerId: 5,
  address: {
    street: "Rua das Flores",
    neighborhood: "Centro",
    numberHouse: "10",
    reference: "",
    city: "Recife",
  },
  ...overrides,
});

const formValues = (
  overrides: Partial<ClientEditFormValues> = {},
): ClientEditFormValues => ({
  name: "Maria",
  cpf: "",
  phone: "(81)98888-7777",
  address: {
    street: "Rua A",
    neighborhood: "Centro",
    numberHouse: "10",
    reference: "",
    city: "Recife",
  },
  ...overrides,
});

describe("emptyClientFilters e hasClientFilters", () => {
  it("emptyClientFilters usa 'all' e aceita busca inicial", () => {
    expect(emptyClientFilters()).toEqual({
      search: "",
      phone: "",
      city: ALL_CLIENTS,
      status: ALL_CLIENTS,
    });
    expect(emptyClientFilters("ana").search).toBe("ana");
  });

  it("hasClientFilters detecta qualquer filtro ativo", () => {
    expect(hasClientFilters(emptyClientFilters())).toBe(false);
    expect(hasClientFilters(emptyClientFilters("a"))).toBe(true);
    expect(hasClientFilters({ ...emptyClientFilters(), phone: "8" })).toBe(
      true,
    );
    expect(hasClientFilters({ ...emptyClientFilters(), city: "Recife" })).toBe(
      true,
    );
    expect(
      hasClientFilters({ ...emptyClientFilters(), status: "inactive" }),
    ).toBe(true);
  });
});

describe("filterClients", () => {
  const clients = [
    makeClient({ id: 1 }),
    makeClient({
      id: 2,
      name: "João Souza",
      phone: "11977776666",
      active: false,
      registerId: 6,
      address: {
        street: "Avenida Brasil",
        neighborhood: "Boa Vista",
        numberHouse: "5",
        reference: "",
        city: "Olinda",
      },
    }),
    makeClient({ id: 3, name: "Sem Endereço", address: null }),
  ];
  const ids = (filters: Parameters<typeof filterClients>[1]) =>
    filterClients(clients, filters).map((c) => c.id);

  it("sem filtros retorna todos", () => {
    expect(ids(emptyClientFilters())).toEqual([1, 2, 3]);
  });

  it("busca por nome, bairro ou rua, ignorando caixa", () => {
    expect(ids(emptyClientFilters("  JOÃO "))).toEqual([2]);
    expect(ids(emptyClientFilters("boa vista"))).toEqual([2]);
    expect(ids(emptyClientFilters("flores"))).toEqual([1]);
  });

  it("filtra por telefone ignorando a máscara", () => {
    expect(ids({ ...emptyClientFilters(), phone: "(11) 97777" })).toEqual([2]);
  });

  it("filtra por cidade e exclui clientes sem endereço", () => {
    expect(ids({ ...emptyClientFilters(), city: "Recife" })).toEqual([1]);
  });

  it("filtra por status ativo e inativo", () => {
    expect(ids({ ...emptyClientFilters(), status: "active" })).toEqual([1, 3]);
    expect(ids({ ...emptyClientFilters(), status: "inactive" })).toEqual([2]);
  });

  it("combina filtros", () => {
    expect(
      ids({ search: "joão", phone: "11", city: "Olinda", status: "inactive" }),
    ).toEqual([2]);
    expect(
      ids({ search: "joão", phone: "", city: "Recife", status: "all" }),
    ).toEqual([]);
  });
});

describe("citiesOfClients", () => {
  it("retorna cidades únicas ordenadas, ignorando sem endereço e vazias", () => {
    const withCity = (city: string) =>
      makeClient({ address: { ...makeClient().address!, city } });

    expect(
      citiesOfClients([
        withCity("Recife"),
        withCity("Olinda"),
        withCity("Recife"),
        withCity(""),
        makeClient({ address: null }),
      ]),
    ).toEqual(["Olinda", "Recife"]);
  });
});

describe("toClientEditFormValues", () => {
  it("aplica máscaras de CPF e telefone", () => {
    const result = toClientEditFormValues(
      makeClient({ cpf: "52998224725", phone: "81988887777" }),
    );

    expect(result.cpf).toBe(VALID_CPF);
    expect(result.phone).toBe("(81)98888-7777");
    expect(result.address.street).toBe("Rua das Flores");
  });

  it("cpf nulo vira string vazia e endereço nulo vira campos vazios", () => {
    const result = toClientEditFormValues(
      makeClient({ cpf: null, address: null }),
    );

    expect(result.cpf).toBe("");
    expect(result.address).toEqual({
      street: "",
      neighborhood: "",
      numberHouse: "",
      reference: "",
      city: "",
    });
  });
});

describe("validateClientEditForm", () => {
  it("formulário válido não tem erros (CPF opcional)", () => {
    expect(validateClientEditForm(formValues())).toEqual({});
    expect(validateClientEditForm(formValues({ cpf: VALID_CPF }))).toEqual({});
  });

  it("valida nome, CPF e telefone", () => {
    const errors = validateClientEditForm(
      formValues({ name: "  ", cpf: "111.111.111-11", phone: "123" }),
    );

    expect(errors.name).toBe("Informe o nome.");
    expect(errors.cpf).toMatch(/CPF inválido/);
    expect(errors.phone).toBe("Telefone inválido. Use DDD + número.");
  });

  it("telefone vazio pede o telefone", () => {
    expect(validateClientEditForm(formValues({ phone: " " })).phone).toBe(
      "Informe o telefone.",
    );
  });

  it("retorna erros aninhados do endereço", () => {
    const errors = validateClientEditForm(
      formValues({
        address: {
          street: "",
          neighborhood: " ",
          numberHouse: "",
          reference: "",
          city: "",
        },
      }),
    );

    expect(errors.address).toEqual({
      street: "Informe a rua.",
      neighborhood: "Informe o bairro.",
      city: "Informe a cidade.",
      numberHouse: "Informe o número.",
    });
  });

  it("numberHouse vazio pede o número", () => {
    const errors = validateClientEditForm(
      formValues({ address: { ...formValues().address, numberHouse: "" } }),
    );
    expect(errors.address?.numberHouse).toBe("Informe o número.");
  });

  it("numberHouse não numérico pede apenas números", () => {
    const errors = validateClientEditForm(
      formValues({ address: { ...formValues().address, numberHouse: "S/N" } }),
    );
    expect(errors.address?.numberHouse).toBe(
      "Informe apenas números (ex.: 120).",
    );
  });

  it("numberHouse numérico não gera erro", () => {
    const errors = validateClientEditForm(
      formValues({ address: { ...formValues().address, numberHouse: "120" } }),
    );
    expect(errors.address).toBeUndefined();
  });

  it("referência não é obrigatória", () => {
    expect(validateClientEditForm(formValues()).address).toBeUndefined();
  });
});

describe("toClientUpdateInput", () => {
  it("remove máscaras e converte número da casa", () => {
    expect(toClientUpdateInput(formValues({ cpf: VALID_CPF }))).toEqual({
      client: { name: "Maria", cpf: "52998224725", phone: "81988887777" },
      address: {
        street: "Rua A",
        neighborhood: "Centro",
        city: "Recife",
        numberHouse: 10,
        reference: "",
      },
    });
  });

  it("aplica trim em todos os campos de texto", () => {
    expect(
      toClientUpdateInput(
        formValues({
          name: "  Maria  ",
          address: {
            street: "  Rua A ",
            neighborhood: " Centro  ",
            numberHouse: " 12 ",
            reference: "  Perto ",
            city: " Recife ",
          },
        }),
      ),
    ).toEqual({
      client: { name: "Maria", cpf: undefined, phone: "81988887777" },
      address: {
        street: "Rua A",
        neighborhood: "Centro",
        city: "Recife",
        numberHouse: 12,
        reference: "Perto",
      },
    });
  });

  it("cpf vazio vira undefined", () => {
    expect(toClientUpdateInput(formValues()).client.cpf).toBeUndefined();
  });
});
