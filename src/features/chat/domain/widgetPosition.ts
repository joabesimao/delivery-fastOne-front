export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export const FAB_SIZE = 56;
const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 620;
const EDGE = 8;
const MOBILE_BREAKPOINT = 600;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const panelSizeFor = ({ width, height }: WidgetSize): WidgetSize =>
  width < MOBILE_BREAKPOINT
    ? {
        width: Math.min(width - 20, PANEL_WIDTH),
        height: Math.min(Math.floor(height * 0.78), PANEL_HEIGHT),
      }
    : { width: PANEL_WIDTH, height: PANEL_HEIGHT };

export const clampPosition = (
  position: WidgetPosition,
  open: boolean,
  viewport: WidgetSize,
): WidgetPosition => {
  const widget = open
    ? panelSizeFor(viewport)
    : { width: FAB_SIZE, height: FAB_SIZE };
  return {
    x: clamp(
      position.x,
      EDGE,
      Math.max(EDGE, viewport.width - widget.width - EDGE),
    ),
    y: clamp(
      position.y,
      EDGE,
      Math.max(EDGE, viewport.height - widget.height - EDGE),
    ),
  };
};

export const initialPosition = (viewport: WidgetSize): WidgetPosition =>
  clampPosition(
    {
      x: viewport.width - panelSizeFor(viewport).width - 24,
      y: viewport.height - 96,
    },
    false,
    viewport,
  );
