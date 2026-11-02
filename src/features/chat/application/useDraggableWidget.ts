import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  clampPosition,
  initialPosition,
  panelSizeFor,
  type WidgetPosition,
  type WidgetSize,
} from "../domain/widgetPosition";

const viewport = (): WidgetSize => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const useDraggableWidget = (open: boolean) => {
  const [position, setPosition] = useState<WidgetPosition>(() =>
    initialPosition(viewport()),
  );
  const dragRef = useRef<{
    id: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    const onMove = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;
      setPosition(
        clampPosition(
          { x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY },
          open,
          viewport(),
        ),
      );
    };
    const onUp = (event: globalThis.PointerEvent) => {
      if (dragRef.current?.id === event.pointerId) dragRef.current = null;
    };
    const onResize = () =>
      setPosition((current) => clampPosition(current, open, viewport()));

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const beginDrag = (event: PointerEvent<HTMLElement>) => {
    const shown = clampPosition(position, open, viewport());
    dragRef.current = {
      id: event.pointerId,
      offsetX: event.clientX - shown.x,
      offsetY: event.clientY - shown.y,
    };
  };

  const current = viewport();
  return {
    position: clampPosition(position, open, current),
    panelSize: panelSizeFor(current),
    beginDrag,
  };
};
