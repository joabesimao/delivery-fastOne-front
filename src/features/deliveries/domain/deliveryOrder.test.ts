import { describe, expect, it } from "vitest";
import {
  isPositiveAmount,
  isPositiveQuantity,
  toCreateDeliveryInput,
  toDeliveryOrderClient,
  toDeliveryOrderFormValues,
  toPreloadedOrderClient,
  validateDeliveryOrderForm,
  type DeliveryOrderClient,
  type DeliveryOrderFormValues,
} from "./deliveryOrder";

const address = {
  street: "Rua A",
  neighborhood: "Centro",
  numberHouse: "10",
  reference: "",
  city: "Recife",
};

const client: DeliveryOrderClient = {
  registerId: 7,
  name: "Maria",
  phone: "(81)99999-9999",
  address,
};

const values = (
  overrides: Partial<DeliveryOrderFormValues> = {},
): DeliveryOrderFormValues => ({
  client,
  deliverymanId: "",
  quantity: "2",
  amount: "25,50",
  ...overrides,
});

describe("toDeliveryOrderClient", () => {
  it("mapeia o register aplicando a máscara de telefone", () => {
    expect(
      toDeliveryOrderClient({
        id: 3,
        name: "João",
        phone: "81988887777",
        address,
      }),
    ).toEqual({
      registerId: 3,
      name: "João",
      phone: "(81)98888-7777",
      address,
    });
  });
});

describe("toPreloadedOrderClient", () => {
  it("retorna null sem clientData ou sem preloaded", () => {
    expect(toPreloadedOrderClient(undefined)).toBeNull();
    expect(toPreloadedOrderClient(null)).toBeNull();
    expect(toPreloadedOrderClient({ id: 1 })).toBeNull();
  });

  it("monta o cliente, usa id 0 sem id e normaliza reference ausente", () => {
    const result = toPreloadedOrderClient({
      clientData: {
        name: "Ana",
        phone: "8133334444",
        address: { ...address, reference: undefined as unknown as string },
      },
    });

    expect(result).toEqual({
      registerId: 0,
      name: "Ana",
      phone: "(81)3333-4444",
      address: { ...address, reference: "" },
    });
  });

  it("usa o id informado", () => {
    expect(
      toPreloadedOrderClient({
        id: 9,
        clientData: { name: "A", phone: "", address },
      })?.registerId,
    ).toBe(9);
  });
});

describe("toDeliveryOrderFormValues", () => {
  it("cria valores vazios com ou sem cliente", () => {
    expect(toDeliveryOrderFormValues()).toEqual({
      client: null,
      deliverymanId: "",
      quantity: "",
      amount: "",
    });
    expect(toDeliveryOrderFormValues(client).client).toBe(client);
  });
});

describe("isPositiveAmount", () => {
  it("aceita valores positivos em formato brasileiro", () => {
    expect(isPositiveAmount("25,50")).toBe(true);
    expect(isPositiveAmount("1.234,56")).toBe(true);
  });

  it("rejeita vazio, zero, negativo e texto", () => {
    expect(isPositiveAmount("")).toBe(false);
    expect(isPositiveAmount("0,00")).toBe(false);
    expect(isPositiveAmount("-5,00")).toBe(false);
    expect(isPositiveAmount("abc")).toBe(false);
  });
});

describe("isPositiveQuantity", () => {
  it("aceita números positivos e rejeita vazio, zero, negativo e texto", () => {
    expect(isPositiveQuantity("3")).toBe(true);
    expect(isPositiveQuantity("")).toBe(false);
    expect(isPositiveQuantity("0")).toBe(false);
    expect(isPositiveQuantity("-1")).toBe(false);
    expect(isPositiveQuantity("abc")).toBe(false);
  });
});

describe("validateDeliveryOrderForm", () => {
  it("formulário válido não tem erros", () => {
    expect(validateDeliveryOrderForm(values())).toEqual({});
  });

  it("retorna erro por campo", () => {
    expect(
      validateDeliveryOrderForm(
        values({ client: null, quantity: "", amount: "" }),
      ),
    ).toEqual({
      client: "Selecione um cliente.",
      quantity: "Informe a quantidade.",
      amount: "Informe o valor.",
    });
  });

  it("cliente com registerId 0 é considerado ausente", () => {
    expect(
      validateDeliveryOrderForm(
        values({ client: { ...client, registerId: 0 } }),
      ).client,
    ).toBe("Selecione um cliente.");
  });
});

describe("toCreateDeliveryInput", () => {
  it("converte valor para número e omite deliverymanId vazio", () => {
    const input = toCreateDeliveryInput(values(), 7);

    expect(input).toEqual({ registerId: 7, quantity: "2", amount: 25.5 });
    expect("deliverymanId" in input).toBe(false);
  });

  it("converte deliverymanId para número quando informado", () => {
    expect(
      toCreateDeliveryInput(values({ deliverymanId: "4" }), 7).deliverymanId,
    ).toBe(4);
  });

  it("valor inválido vira 0", () => {
    expect(toCreateDeliveryInput(values({ amount: "abc" }), 7).amount).toBe(0);
  });
});
