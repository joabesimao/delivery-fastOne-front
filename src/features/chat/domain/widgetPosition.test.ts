import { describe, expect, it } from "vitest";
import {
  FAB_SIZE,
  clampPosition,
  initialPosition,
  panelSizeFor,
} from "./widgetPosition";

const desktop = { width: 1200, height: 800 };
const mobile = { width: 400, height: 700 };

describe("panelSizeFor", () => {
  it("usa tamanho fixo no desktop", () => {
    expect(panelSizeFor(desktop)).toEqual({ width: 420, height: 620 });
  });

  it("adapta ao viewport no mobile", () => {
    expect(panelSizeFor(mobile)).toEqual({ width: 380, height: 546 });
  });

  it("limita ao tamanho máximo do painel em viewport mobile alto", () => {
    expect(panelSizeFor({ width: 599, height: 2000 }).height).toBe(620);
  });
});

describe("clampPosition", () => {
  it("mantém posição válida", () => {
    expect(clampPosition({ x: 100, y: 100 }, false, desktop)).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("limita ao canto superior esquerdo com margem", () => {
    expect(clampPosition({ x: -50, y: -50 }, false, desktop)).toEqual({
      x: 8,
      y: 8,
    });
  });

  it("limita ao canto inferior direito considerando o botão fechado", () => {
    expect(clampPosition({ x: 5000, y: 5000 }, false, desktop)).toEqual({
      x: 1200 - FAB_SIZE - 8,
      y: 800 - FAB_SIZE - 8,
    });
  });

  it("considera o tamanho do painel quando aberto", () => {
    expect(clampPosition({ x: 5000, y: 5000 }, true, desktop)).toEqual({
      x: 1200 - 420 - 8,
      y: 800 - 620 - 8,
    });
  });

  it("respeita o painel reduzido em viewport minúsculo", () => {
    expect(
      clampPosition({ x: 300, y: 300 }, true, { width: 100, height: 100 }),
    ).toEqual({ x: 12, y: 14 });
  });
});

describe("initialPosition", () => {
  it("posiciona no canto inferior direito dentro dos limites", () => {
    const pos = initialPosition(desktop);
    expect(pos).toEqual({ x: 1200 - 420 - 24, y: 800 - 96 });
    expect(pos.x + FAB_SIZE).toBeLessThanOrEqual(desktop.width - 8);
  });

  it("no mobile fica dentro da tela", () => {
    const pos = initialPosition(mobile);
    expect(pos.x).toBeGreaterThanOrEqual(8);
    expect(pos.y + FAB_SIZE).toBeLessThanOrEqual(mobile.height - 8);
  });
});
