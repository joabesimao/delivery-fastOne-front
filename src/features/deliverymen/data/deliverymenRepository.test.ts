import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { deliverymenRepository } from "./deliverymenRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("deliverymenRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list mapeia o DTO completo", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [
        {
          id: 1,
          name: "João",
          lastName: "Silva",
          phone: "11999998888",
          cpf: "52998224725",
          numberQualification: "123",
        },
      ],
    });

    expect(await deliverymenRepository.list()).toEqual([
      {
        id: 1,
        name: "João",
        lastName: "Silva",
        phone: "11999998888",
        cpf: "52998224725",
        numberQualification: "123",
      },
    ]);
    expect(httpClient.get).toHaveBeenCalledWith("/deliveryman", {
      params: undefined,
    });
  });

  it("list normaliza nulos e CPF vazio", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [
        {
          id: 1,
          name: "A",
          lastName: "B",
          phone: null,
          cpf: "",
          numberQualification: null,
        },
        { id: 2, name: "C", lastName: "D" },
      ],
    });

    const result = await deliverymenRepository.list();

    expect(result).toEqual([
      {
        id: 1,
        name: "A",
        lastName: "B",
        phone: "",
        cpf: null,
        numberQualification: "",
      },
      {
        id: 2,
        name: "C",
        lastName: "D",
        phone: "",
        cpf: null,
        numberQualification: "",
      },
    ]);
  });

  it("create, update e remove usam o endpoint /deliveryman", async () => {
    const input = {
      name: "A",
      lastName: "B",
      phone: "11999998888",
      numberQualification: "1",
    };

    await deliverymenRepository.create(input);
    await deliverymenRepository.update(7, input);
    await deliverymenRepository.remove(7);

    expect(httpClient.post).toHaveBeenCalledWith("/deliveryman", input);
    expect(httpClient.put).toHaveBeenCalledWith("/deliveryman/7", input);
    expect(httpClient.delete).toHaveBeenCalledWith("/deliveryman/7");
  });
});
