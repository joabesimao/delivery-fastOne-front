import { describe, expect, it } from "vitest";
import type { Product } from "./product";
import {
  catalogCsvFileName,
  stockInfoOf,
  summarizeCatalog,
  toCatalogCsv,
  toProductListParams,
  visibleProducts,
  type ProductPageQuery,
} from "./productCatalog";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: "Pizza",
  price: 10,
  description: "Desc",
  category: "Pizzas",
  status: true,
  ...overrides,
});

const query = (
  overrides: Partial<ProductPageQuery> = {},
): ProductPageQuery => ({
  name: "",
  category: "all",
  priceMin: "",
  priceMax: "",
  page: 0,
  rowsPerPage: 10,
  ...overrides,
});

describe("stockInfoOf", () => {
  it("considera em estoque ids não múltiplos de 5", () => {
    expect(stockInfoOf({ id: 1 })).toEqual({
      status: "in",
      label: "Em Estoque",
    });
    expect(stockInfoOf({ id: 7 }).status).toBe("in");
  });

  it("considera baixo estoque ids múltiplos de 5 com quantidade derivada do id", () => {
    expect(stockInfoOf({ id: 5 })).toEqual({
      status: "low",
      label: "Apenas 3 un",
    });
    expect(stockInfoOf({ id: 10 })).toEqual({
      status: "low",
      label: "Apenas 2 un",
    });
    expect(stockInfoOf({ id: 15 })).toEqual({
      status: "low",
      label: "Apenas 1 un",
    });
  });
});

describe("toProductListParams", () => {
  it("monta limit e offset a partir da página", () => {
    expect(toProductListParams(query({ page: 2, rowsPerPage: 9 }))).toEqual({
      limit: 9,
      offset: 18,
    });
  });

  it("inclui nome e categoria quando informados", () => {
    expect(
      toProductListParams(query({ name: "piz", category: "Pizzas" })),
    ).toEqual({ limit: 10, offset: 0, name: "piz", category: "Pizzas" });
  });

  it("converte preços mínimo e máximo em número", () => {
    expect(
      toProductListParams(query({ priceMin: "10,50", priceMax: "1.000,00" })),
    ).toEqual({ limit: 10, offset: 0, priceMin: 10.5, priceMax: 1000 });
  });

  it("ignora preços vazios e preserva o zero", () => {
    expect(toProductListParams(query({ priceMin: "", priceMax: "" }))).toEqual({
      limit: 10,
      offset: 0,
    });
    expect(toProductListParams(query({ priceMin: "0" }))).toMatchObject({
      priceMin: 0,
    });
  });

  it("não inclui preço mínimo ou máximo não numérico", () => {
    const onlyMax = toProductListParams(query({ priceMax: "abc" }));
    expect(onlyMax).toEqual({ limit: 10, offset: 0 });
    expect(onlyMax).not.toHaveProperty("priceMax");

    const onlyMin = toProductListParams(query({ priceMin: "abc" }));
    expect(onlyMin).toEqual({ limit: 10, offset: 0 });
    expect(onlyMin).not.toHaveProperty("priceMin");
  });
});

describe("visibleProducts", () => {
  const list = [
    product({ id: 1, name: "Coxinha", price: 5 }),
    product({ id: 5, name: "Alface", price: 20 }),
    product({ id: 10, name: "Bolo", price: 15 }),
  ];

  it("recent ordena por id decrescente", () => {
    expect(visibleProducts(list, "all", "recent").map((p) => p.id)).toEqual([
      10, 5, 1,
    ]);
  });

  it("name ordena alfabeticamente", () => {
    expect(visibleProducts(list, "all", "name").map((p) => p.name)).toEqual([
      "Alface",
      "Bolo",
      "Coxinha",
    ]);
  });

  it("priceAsc e priceDesc ordenam por preço", () => {
    expect(visibleProducts(list, "all", "priceAsc").map((p) => p.id)).toEqual([
      1, 10, 5,
    ]);
    expect(visibleProducts(list, "all", "priceDesc").map((p) => p.id)).toEqual([
      5, 10, 1,
    ]);
  });

  it("filtra por estoque", () => {
    expect(visibleProducts(list, "low", "recent").map((p) => p.id)).toEqual([
      10, 5,
    ]);
    expect(visibleProducts(list, "in", "recent").map((p) => p.id)).toEqual([1]);
  });

  it("não altera a lista original", () => {
    const original = [...list];

    visibleProducts(list, "all", "name");

    expect(list).toEqual(original);
  });
});

describe("summarizeCatalog", () => {
  it("agrega categorias por contagem, preço médio e baixo estoque", () => {
    const result = summarizeCatalog([
      product({ id: 1, category: "A", price: 10 }),
      product({ id: 2, category: "B", price: 20 }),
      product({ id: 5, category: "B", price: 30 }),
    ]);

    expect(result.categories).toEqual([
      { category: "B", count: 2 },
      { category: "A", count: 1 },
    ]);
    expect(result.averagePrice).toBe(20);
    expect(result.lowStockCount).toBe(1);
  });

  it("trata amostra vazia", () => {
    expect(summarizeCatalog([])).toEqual({
      categories: [],
      averagePrice: 0,
      lowStockCount: 0,
    });
  });
});

describe("toCatalogCsv", () => {
  it("gera cabeçalho e linhas separadas por ponto e vírgula", () => {
    const csv = toCatalogCsv([
      product({
        id: 3,
        name: "Pizza",
        category: "Pizzas",
        brand: "Marca",
        barcode: "789",
        price: 1234.5,
        description: "Boa",
      }),
    ]);

    expect(csv.split("\n")).toEqual([
      "ID;Nome;Categoria;Marca;Código de barras;Preço;Status;Descrição",
      '3;"Pizza";"Pizzas";"Marca";"789";1.234,50;Ativo;"Boa"',
    ]);
  });

  it("escapa aspas, preenche nulos e marca inativo", () => {
    const csv = toCatalogCsv([
      product({
        id: 4,
        name: 'Pizza "Especial"',
        brand: null,
        barcode: undefined,
        status: false,
        price: 9,
      }),
    ]);

    expect(csv.split("\n")[1]).toBe(
      '4;"Pizza ""Especial""";"Pizzas";"";"";9,00;Inativo;"Desc"',
    );
  });

  it("gera apenas o cabeçalho para lista vazia", () => {
    expect(toCatalogCsv([]).split("\n")).toHaveLength(1);
  });
});

describe("catalogCsvFileName", () => {
  it("usa a página em base 1", () => {
    expect(catalogCsvFileName(0)).toBe("cardapio-pagina-1.csv");
    expect(catalogCsvFileName(4)).toBe("cardapio-pagina-5.csv");
  });
});
