import { describe, expect, it } from "vitest";
import {
  initialProductImage,
  MAX_PRODUCT_IMAGE_BYTES,
  toProductErrorMessage,
  toProductFormValues,
  toProductImageSrc,
  toProductInput,
  validateProductForm,
  validateProductImageFile,
  type Product,
  type ProductFormValues,
  type ProductImage,
} from "./product";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: "Pizza",
  price: 39.9,
  description: "Pizza grande",
  category: "Pizzas",
  status: true,
  ...overrides,
});

const form = (
  overrides: Partial<ProductFormValues> = {},
): ProductFormValues => ({
  name: "Pizza",
  price: "39,90",
  description: "Pizza grande",
  category: "Pizzas",
  subcategory: "",
  brand: "",
  model: "",
  unit: "",
  barcode: "",
  status: true,
  notes: "",
  variations: [],
  ...overrides,
});

const unchangedImage: ProductImage = {
  preview: null,
  mimeType: null,
  status: "unchanged",
};

describe("toProductImageSrc", () => {
  it("monta o data URL com o mime informado", () => {
    expect(toProductImageSrc("abc", "image/png")).toBe(
      "data:image/png;base64,abc",
    );
  });

  it("usa image/jpeg como mime padrão", () => {
    expect(toProductImageSrc("abc")).toBe("data:image/jpeg;base64,abc");
    expect(toProductImageSrc("abc", null)).toBe("data:image/jpeg;base64,abc");
  });

  it("retorna null sem imagem", () => {
    expect(toProductImageSrc(null, "image/png")).toBeNull();
    expect(toProductImageSrc("")).toBeNull();
  });
});

describe("initialProductImage", () => {
  it("deriva o preview do produto existente", () => {
    expect(
      initialProductImage(
        product({ imageBase64: "xyz", imageMimeType: "image/webp" }),
      ),
    ).toEqual({
      preview: "data:image/webp;base64,xyz",
      mimeType: null,
      status: "unchanged",
    });
  });

  it("não tem preview sem produto", () => {
    expect(initialProductImage(null)).toEqual({
      preview: null,
      mimeType: null,
      status: "unchanged",
    });
  });
});

describe("validateProductImageFile", () => {
  it("aceita imagem dentro do limite", () => {
    expect(
      validateProductImageFile({ type: "image/png", size: 1024 }),
    ).toBeNull();
  });

  it("aceita imagem exatamente no limite de 5MB", () => {
    expect(
      validateProductImageFile({
        type: "image/jpeg",
        size: MAX_PRODUCT_IMAGE_BYTES,
      }),
    ).toBeNull();
  });

  it("rejeita imagem acima de 5MB", () => {
    expect(
      validateProductImageFile({
        type: "image/jpeg",
        size: MAX_PRODUCT_IMAGE_BYTES + 1,
      }),
    ).toBe("A imagem não pode ter mais de 5MB.");
  });

  it("rejeita arquivo que não é imagem", () => {
    expect(
      validateProductImageFile({ type: "application/pdf", size: 10 }),
    ).toBe("Selecione uma imagem válida.");
  });

  it("funciona com objetos File reais", () => {
    const png = new File(["x"], "a.png", { type: "image/png" });
    const txt = new File(["x"], "a.txt", { type: "text/plain" });

    expect(validateProductImageFile(png)).toBeNull();
    expect(validateProductImageFile(txt)).toBe("Selecione uma imagem válida.");
  });
});

describe("toProductFormValues", () => {
  it("retorna valores padrão sem produto", () => {
    expect(toProductFormValues()).toEqual(
      form({ name: "", price: "", description: "", category: "" }),
    );
  });

  it("converte produto com preço formatado e variações", () => {
    const result = toProductFormValues(
      product({
        price: 1234.5,
        brand: "Marca",
        status: false,
        notes: null,
        variations: [{ id: 9, attribute: "Tamanho", value: "G" }],
      }),
    );

    expect(result.price).toBe("1.234,50");
    expect(result.brand).toBe("Marca");
    expect(result.status).toBe(false);
    expect(result.notes).toBe("");
    expect(result.variations).toEqual([{ attribute: "Tamanho", value: "G" }]);
  });
});

describe("validateProductForm", () => {
  it("aceita formulário válido", () => {
    expect(validateProductForm(form())).toEqual({});
  });

  it("exige nome, descrição, categoria e preço", () => {
    expect(
      validateProductForm(
        form({ name: " ", description: "", category: "", price: "" }),
      ),
    ).toEqual({
      name: "Informe o nome do produto.",
      description: "Informe a descrição.",
      category: "Informe a categoria.",
      price: "Informe um preço válido.",
    });
  });

  it.each(["0,00", "abc", "-5"])("rejeita preço %s", (price) => {
    expect(validateProductForm(form({ price })).price).toBe(
      "Informe um preço válido.",
    );
  });
});

describe("toProductInput", () => {
  it("normaliza textos, converte moeda e transforma vazios em null", () => {
    const result = toProductInput(
      form({
        name: "  Pizza ",
        price: "1.234,50",
        brand: " Marca ",
        notes: "   ",
      }),
      unchangedImage,
    );

    expect(result).toEqual({
      name: "Pizza",
      price: 1234.5,
      description: "Pizza grande",
      category: "Pizzas",
      subcategory: null,
      brand: "Marca",
      model: null,
      unit: null,
      barcode: null,
      status: true,
      notes: null,
      variations: [],
    });
  });

  it("descarta variações incompletas e aplica trim nas demais", () => {
    const result = toProductInput(
      form({
        variations: [
          { attribute: " Cor ", value: " Azul " },
          { attribute: "Tamanho", value: " " },
          { attribute: "", value: "G" },
        ],
      }),
      unchangedImage,
    );

    expect(result.variations).toEqual([{ attribute: "Cor", value: "Azul" }]);
  });

  it("não envia campos de imagem quando inalterada", () => {
    const result = toProductInput(form(), unchangedImage);

    expect("imageBase64" in result).toBe(false);
    expect("imageMimeType" in result).toBe(false);
  });

  it("envia imagem quando substituída", () => {
    const result = toProductInput(form(), {
      preview: "base64data",
      mimeType: "image/png",
      status: "replaced",
    });

    expect(result.imageBase64).toBe("base64data");
    expect(result.imageMimeType).toBe("image/png");
  });

  it("envia nulls quando a imagem é removida", () => {
    const result = toProductInput(form(), {
      preview: null,
      mimeType: null,
      status: "removed",
    });

    expect(result.imageBase64).toBeNull();
    expect(result.imageMimeType).toBeNull();
  });
});

describe("toProductErrorMessage", () => {
  it("traduz erro de código de barras duplicado", () => {
    expect(
      toProductErrorMessage(
        { response: { data: { error: "Invalid param: barcode" } } },
        false,
      ),
    ).toBe("Já existe um produto com esse código de barras.");
  });

  it("prefere response.data.error, depois message da resposta, depois message", () => {
    expect(
      toProductErrorMessage(
        { response: { data: { error: "E1", message: "E2" } }, message: "E3" },
        false,
      ),
    ).toBe("E1");
    expect(
      toProductErrorMessage(
        { response: { data: { message: "E2" } }, message: "E3" },
        false,
      ),
    ).toBe("E2");
    expect(toProductErrorMessage(new Error("E3"), false)).toBe("E3");
  });

  it("usa mensagem genérica conforme cadastro ou edição", () => {
    expect(toProductErrorMessage({}, false)).toBe(
      "Erro ao cadastrar produto. Tente novamente.",
    );
    expect(toProductErrorMessage(undefined, true)).toBe(
      "Erro ao atualizar produto. Tente novamente.",
    );
  });
});
