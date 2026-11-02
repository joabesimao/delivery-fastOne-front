import { describe, expect, it, vi } from "vitest";
import {
  EMPTY_NOTICE,
  NOTICE_BODY_MAX,
  NOTICE_TITLE_MAX,
  noticeSentFeedback,
  roleLabel,
  toBroadcastPayload,
  validateNotice,
} from "./notice";

vi.mock("@/features/users", () => ({
  ROLE_OPTIONS: [
    { value: "admin", label: "Administrador" },
    { value: "entregador", label: "Entregador" },
  ],
}));

const valid = { ...EMPTY_NOTICE, title: "Título", body: "Mensagem" };

describe("validateNotice", () => {
  it("exige título e mensagem", () => {
    expect(validateNotice(EMPTY_NOTICE)).toEqual({
      title: "Informe o título.",
      body: "Escreva a mensagem.",
    });
    expect(
      validateNotice({ ...valid, title: "  ", body: "  " }),
    ).toHaveProperty("title");
  });

  it("aceita os limites exatos e rejeita acima", () => {
    expect(
      validateNotice({
        ...valid,
        title: "a".repeat(NOTICE_TITLE_MAX),
        body: "b".repeat(NOTICE_BODY_MAX),
      }),
    ).toEqual({});

    const errors = validateNotice({
      ...valid,
      title: "a".repeat(NOTICE_TITLE_MAX + 1),
      body: "b".repeat(NOTICE_BODY_MAX + 1),
    });
    expect(errors.title).toBe(`Máximo de ${NOTICE_TITLE_MAX} caracteres.`);
    expect(errors.body).toBe(`Máximo de ${NOTICE_BODY_MAX} caracteres.`);
  });

  it("mede o tamanho após o trim", () => {
    expect(
      validateNotice({ ...valid, title: ` ${"a".repeat(NOTICE_TITLE_MAX)} ` }),
    ).toEqual({});
  });
});

describe("toBroadcastPayload", () => {
  it("omite papéis e unidade quando vazios", () => {
    const payload = toBroadcastPayload({ ...valid, title: " T ", body: " B " });
    expect(payload).toEqual({
      title: "T",
      body: "B",
      roles: undefined,
      unitStoreId: undefined,
    });
  });

  it("converte unidade para número e mantém papéis", () => {
    expect(
      toBroadcastPayload({ ...valid, roles: ["admin"], unitStoreId: "5" }),
    ).toMatchObject({ roles: ["admin"], unitStoreId: 5 });
  });
});

describe("roleLabel", () => {
  it("traduz o papel conhecido e devolve o valor para desconhecido", () => {
    expect(roleLabel("admin")).toBe("Administrador");
    expect(roleLabel("user")).toBe("user");
  });
});

describe("noticeSentFeedback", () => {
  it("trata singular, plural e nenhum destinatário", () => {
    expect(noticeSentFeedback(1)).toEqual({
      message: "Aviso enviado para 1 usuário.",
      severity: "success",
    });
    expect(noticeSentFeedback(3).message).toBe(
      "Aviso enviado para 3 usuários.",
    );
    expect(noticeSentFeedback(0).severity).toBe("info");
  });
});
