import { describe, expect, it } from "vitest";
import {
  deliveryDeliverymanName,
  deliveryStreetLine,
  isFinishedDelivery,
  type Delivery,
} from "./delivery";

describe("isFinishedDelivery", () => {
  it("só 'finished' é finalizada", () => {
    const finished = isFinishedDelivery({ status: "finished" } as Delivery);
    const delivered = isFinishedDelivery({ status: "delivered" } as Delivery);
    const active = isFinishedDelivery({ status: "actived" } as Delivery);

    expect([finished, delivered, active]).toEqual([true, false, false]);
  });
});

describe("deliveryDeliverymanName", () => {
  it("junta nome e sobrenome e remove espaços sobrando", () => {
    expect(deliveryDeliverymanName({ name: "Ana", lastName: "Souza" })).toBe(
      "Ana Souza",
    );
    expect(deliveryDeliverymanName({ name: "Ana", lastName: "" })).toBe("Ana");
  });
});

describe("deliveryStreetLine", () => {
  it("formata rua e número", () => {
    expect(
      deliveryStreetLine({
        street: "Rua A",
        numberHouse: "12",
        neighborhood: "",
        city: "",
        reference: "",
      }),
    ).toBe("Rua A, 12");
  });
});
