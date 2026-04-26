import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface VirtualizedChartProps {
  children: React.ReactNode;
  height?: number | string;
  minHeight?: number | string;
  forceRender?: boolean;
  padding?: number | string;
  unmountWhenOutOfView?: boolean;
}

const VirtualizedChart: React.FC<VirtualizedChartProps> = ({
  children,
  height = "auto",
  minHeight = "250px",
  forceRender = false,
  padding = "8px",
  unmountWhenOutOfView = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: !unmountWhenOutOfView,
    rootMargin: "100px 0px",
  });

  useEffect(() => {
    if (forceRender) {
      setIsVisible(true);
      return;
    }

    if (inView && !isVisible) {
      setIsVisible(true);
    } else if (unmountWhenOutOfView && !inView && isVisible) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [forceRender, inView, isVisible, unmountWhenOutOfView]);

  // Se forceRender for true, sempre renderiza (modo impressão)
  const shouldRender = forceRender || isVisible;

  return (
    <div
      ref={ref}
      style={{
        height: height,
        minHeight: minHeight,
        width: "100%",
        padding: padding,
        boxSizing: "border-box",
      }}
    >
      {shouldRender ? children : null}
    </div>
  );
};

export default React.memo(VirtualizedChart);
