import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createFakeSocket } from "@/test/fakeSocket";
import { chatGateway } from "../data/chatGateway";
import { useChatComposer } from "./useChatComposer";

vi.mock("../data/chatGateway", () => ({
  chatGateway: { send: vi.fn() },
}));

describe("useChatComposer", () => {
  let socket: ReturnType<typeof createFakeSocket>;
  let onError: Mock<(message: string | null) => void>;

  beforeEach(() => {
    socket = createFakeSocket();
    onError = vi.fn<(message: string | null) => void>();
    vi.mocked(chatGateway.send).mockResolvedValue({ ok: true });
  });

  const render = (extra: Record<string, unknown> = {}) =>
    renderHook(() =>
      useChatComposer({
        socket: socket as never,
        selectedUnitId: "10",
        sendError: "erro ao enviar",
        imageError: "erro na foto",
        onError,
        ...extra,
      }),
    );

  const photo = () => new File(["abc"], "foto.png", { type: "image/png" });

  it("começa vazio e sem poder enviar", () => {
    const { result } = render();
    expect(result.current.text).toBe("");
    expect(result.current.attachment).toBeNull();
    expect(result.current.canSend).toBe(false);
  });

  it("setText atualiza o texto, habilita o envio e chama onTextChange", () => {
    const onTextChange = vi.fn();
    const { result } = render({ onTextChange });
    act(() => result.current.setText("oi"));
    expect(result.current.text).toBe("oi");
    expect(result.current.canSend).toBe(true);
    expect(onTextChange).toHaveBeenCalledTimes(1);
  });

  it("texto só com espaços não permite enviar", () => {
    const { result } = render();
    act(() => result.current.setText("   "));
    expect(result.current.canSend).toBe(false);
  });

  it("attach lê o arquivo como data URL e limpa o erro", async () => {
    const { result } = render();
    await act(() => result.current.attach(photo()));
    expect(result.current.attachment).toMatchObject({
      name: "foto.png",
      mimeType: "image/png",
    });
    expect(result.current.attachment?.base64).toMatch(
      /^data:image\/png;base64,/,
    );
    expect(result.current.canSend).toBe(true);
    expect(onError).toHaveBeenCalledWith(null);
  });

  it("attach usa image/jpeg quando o arquivo não informa o tipo", async () => {
    const { result } = render();
    await act(() => result.current.attach(new File(["a"], "x")));
    expect(result.current.attachment?.mimeType).toBe("image/jpeg");
  });

  it("attach reporta imageError quando a leitura falha", async () => {
    const { result } = render();
    vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(
      function (this: FileReader) {
        queueMicrotask(() =>
          this.onerror?.(
            new ProgressEvent("error") as ProgressEvent<FileReader>,
          ),
        );
      },
    );
    await act(() => result.current.attach(photo()));
    expect(onError).toHaveBeenCalledWith("erro na foto");
    expect(result.current.attachment).toBeNull();
  });

  it("clearAttachment remove o anexo", async () => {
    const { result } = render();
    await act(() => result.current.attach(photo()));
    act(() => result.current.clearAttachment());
    expect(result.current.attachment).toBeNull();
  });

  it("send emite o payload com texto e loja e limpa o formulário", async () => {
    const beforeSend = vi.fn();
    const { result } = render({ beforeSend });
    act(() => result.current.setText("olá"));
    await act(() => result.current.send());
    expect(chatGateway.send).toHaveBeenCalledWith(socket, {
      text: "olá",
      imageBase64: null,
      imageMimeType: null,
      unitStoreId: 10,
    });
    expect(beforeSend).toHaveBeenCalledTimes(1);
    expect(result.current.text).toBe("");
    expect(result.current.sending).toBe(false);
    expect(onError).toHaveBeenCalledWith(null);
  });

  it("send inclui a imagem anexada", async () => {
    const { result } = render();
    await act(() => result.current.attach(photo()));
    await act(() => result.current.send());
    expect(chatGateway.send).toHaveBeenCalledWith(
      socket,
      expect.objectContaining({
        text: "",
        imageMimeType: "image/png",
        imageBase64: expect.stringMatching(/^data:image\/png/),
      }),
    );
    expect(result.current.attachment).toBeNull();
  });

  it("marca sending durante o envio e bloqueia canSend", async () => {
    let resolveAck: (ack: { ok: boolean }) => void = () => {};
    vi.mocked(chatGateway.send).mockReturnValue(
      new Promise((resolve) => {
        resolveAck = resolve;
      }),
    );
    const { result } = render();
    act(() => result.current.setText("olá"));
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.send();
    });
    await waitFor(() => expect(result.current.sending).toBe(true));
    expect(result.current.canSend).toBe(false);
    await act(async () => {
      resolveAck({ ok: true });
      await pending;
    });
    expect(result.current.sending).toBe(false);
  });

  it("falha com mensagem do servidor mantém o texto e reporta o erro", async () => {
    vi.mocked(chatGateway.send).mockResolvedValue({
      ok: false,
      error: "bloqueado",
    });
    const { result } = render();
    act(() => result.current.setText("olá"));
    await act(() => result.current.send());
    expect(onError).toHaveBeenLastCalledWith("bloqueado");
    expect(result.current.text).toBe("olá");
  });

  it("falha sem mensagem usa sendError", async () => {
    vi.mocked(chatGateway.send).mockResolvedValue({});
    const { result } = render();
    act(() => result.current.setText("olá"));
    await act(() => result.current.send());
    expect(onError).toHaveBeenLastCalledWith("erro ao enviar");
  });

  it("send sem conteúdo não emite", async () => {
    const { result } = render();
    await act(() => result.current.send());
    expect(chatGateway.send).not.toHaveBeenCalled();
  });

  it("send sem socket não emite", async () => {
    const { result } = render({ socket: null });
    act(() => result.current.setText("olá"));
    await act(() => result.current.send());
    expect(chatGateway.send).not.toHaveBeenCalled();
  });

  it("sem loja selecionada envia unitStoreId indefinido", async () => {
    const { result } = render({ selectedUnitId: "" });
    act(() => result.current.setText("olá"));
    await act(() => result.current.send());
    expect(chatGateway.send).toHaveBeenCalledWith(
      socket,
      expect.objectContaining({ unitStoreId: undefined }),
    );
  });
});
