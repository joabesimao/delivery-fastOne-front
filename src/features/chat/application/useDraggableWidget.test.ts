import { act, renderHook } from "@testing-library/react";
import type { PointerEvent } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDraggableWidget } from "./useDraggableWidget";

const setViewport = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
};

const pointer = (
  type: string,
  init: PointerEventInit & { pointerId: number },
) => {
  const event = new MouseEvent(type, {
    clientX: init.clientX,
    clientY: init.clientY,
  });
  Object.defineProperty(event, "pointerId", { value: init.pointerId });
  window.dispatchEvent(event);
};

const downEvent = (id: number, x: number, y: number) =>
  ({ pointerId: id, clientX: x, clientY: y }) as PointerEvent<HTMLElement>;

describe("useDraggableWidget", () => {
  const original = { w: window.innerWidth, h: window.innerHeight };

  beforeEach(() => setViewport(1200, 800));
  afterEach(() => setViewport(original.w, original.h));

  it("posição inicial fica no canto inferior direito, dentro da viewport", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    expect(result.current.position).toEqual({ x: 756, y: 704 });
  });

  it("panelSize segue a viewport (desktop e mobile)", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    expect(result.current.panelSize).toEqual({ width: 420, height: 620 });
    setViewport(400, 800);
    const mobile = renderHook(() => useDraggableWidget(false));
    expect(mobile.result.current.panelSize).toEqual({
      width: 380,
      height: 620,
    });
  });

  it("arrastar move o widget mantendo o deslocamento do clique", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    const start = result.current.position;
    act(() =>
      result.current.beginDrag(downEvent(1, start.x + 10, start.y + 5)),
    );
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: 400, clientY: 300 }),
    );
    expect(result.current.position).toEqual({ x: 390, y: 295 });
  });

  it("não deixa o widget sair da viewport ao arrastar", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    const start = result.current.position;
    act(() => result.current.beginDrag(downEvent(1, start.x, start.y)));
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: -500, clientY: -500 }),
    );
    expect(result.current.position).toEqual({ x: 8, y: 8 });
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: 9000, clientY: 9000 }),
    );
    expect(result.current.position).toEqual({ x: 1136, y: 736 });
  });

  it("com o painel aberto usa o tamanho do painel como limite", () => {
    const { result } = renderHook(() => useDraggableWidget(true));
    const start = result.current.position;
    act(() => result.current.beginDrag(downEvent(1, start.x, start.y)));
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: 9000, clientY: 9000 }),
    );
    expect(result.current.position).toEqual({
      x: 1200 - 420 - 8,
      y: 800 - 620 - 8,
    });
  });

  it("ignora movimentos sem arrasto ou de outro ponteiro", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    const start = result.current.position;
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: 100, clientY: 100 }),
    );
    expect(result.current.position).toEqual(start);
    act(() => result.current.beginDrag(downEvent(1, start.x, start.y)));
    act(() =>
      pointer("pointermove", { pointerId: 2, clientX: 100, clientY: 100 }),
    );
    expect(result.current.position).toEqual(start);
  });

  it("pointerup encerra o arrasto", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    const start = result.current.position;
    act(() => result.current.beginDrag(downEvent(1, start.x, start.y)));
    act(() => pointer("pointerup", { pointerId: 1, clientX: 0, clientY: 0 }));
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: 100, clientY: 100 }),
    );
    expect(result.current.position).toEqual(start);
  });

  it("pointerup de outro ponteiro não encerra o arrasto", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    const start = result.current.position;
    act(() => result.current.beginDrag(downEvent(1, start.x, start.y)));
    act(() => pointer("pointerup", { pointerId: 2, clientX: 0, clientY: 0 }));
    act(() =>
      pointer("pointermove", { pointerId: 1, clientX: 100, clientY: 100 }),
    );
    expect(result.current.position).toEqual({ x: 100, y: 100 });
  });

  it("ao redimensionar a janela reposiciona dentro da nova viewport", () => {
    const { result } = renderHook(() => useDraggableWidget(false));
    act(() => {
      setViewport(600, 400);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.position).toEqual({ x: 536, y: 336 });
  });

  it("remove os listeners da janela ao desmontar", () => {
    const { result, unmount } = renderHook(() => useDraggableWidget(false));
    const start = result.current.position;
    act(() => result.current.beginDrag(downEvent(1, start.x, start.y)));
    unmount();
    expect(() =>
      pointer("pointermove", { pointerId: 1, clientX: 100, clientY: 100 }),
    ).not.toThrow();
  });
});
