import { describe, expect, it } from "vitest";
import type { Delivery } from "./delivery";
import {
  toFinishDeliveryFormValues,
  toFinishDeliveryInput,
  validateFinishDeliveryForm,
} from "./finishDelivery";

const delivery = (overrides: Partial<Delivery> = {}): Delivery => ({
  id: 1,
  quantity: "3",
  amount: 1234.5,
  createdAt: "2026-01-01T10:00:00.000Z",
  receivedAt: null,
  finishedAt: null,
  status: "delivered",
  deliverymanId: null,
  deliveryman: null,
  unitStoreName: null,
  client: { name: "Maria", phone: "" },
  address: {
    street: "Rua A",
    numberHouse: "1",
    neighborhood: "Centro",
    city: "Recife",
    reference: "",
  },
  ...overrides,
});

describe("toFinishDeliveryFormValues", () => {
  it("formata o valor em pt-BR e usa o id do entregador", () => {
    expect(
      toFinishDeliveryFormValues(
        delivery({
          deliveryman: { id: 8, name: "Ana", lastName: "X", phone: "" },
        }),
      ),
    ).toEqual({ quantity: "3", amount: "1.234,50", deliverymanId: "8" });
  });

  it("deliverymanId vazio quando não há entregador", () => {
    expect(toFinishDeliveryFormValues(delivery()).deliverymanId).toBe("");
  });
});

describe("validateFinishDeliveryForm", () => {
  it("formulário válido não tem erros", () => {
    expect(
      validateFinishDeliveryForm({
        quantity: "2",
        amount: "10,00",
        deliverymanId: "1",
      }),
    ).toEqual({});
  });

  it("retorna erro em todos os campos inválidos", () => {
    expect(
      validateFinishDeliveryForm({
        quantity: "   ",
        amount: "0,00",
        deliverymanId: "",
      }),
    ).toEqual({
      quantity: "Informe a quantidade.",
      amount: "Informe o valor.",
      deliverymanId: "Selecione o entregador.",
    });
  });
});

describe("toFinishDeliveryInput", () => {
  it("monta o payload com status finished e número", () => {
    expect(
      toFinishDeliveryInput({
        quantity: "2",
        amount: "1.234,50",
        deliverymanId: "5",
      }),
    ).toEqual({
      quantity: "2",
      amount: 1234.5,
      status: "finished",
      deliverymanId: 5,
    });
  });

  it("omite deliverymanId vazio e zera valor inválido", () => {
    const input = toFinishDeliveryInput({
      quantity: "2",
      amount: "abc",
      deliverymanId: "",
    });

    expect(input).toEqual({ quantity: "2", amount: 0, status: "finished" });
    expect("deliverymanId" in input).toBe(false);
  });
});
