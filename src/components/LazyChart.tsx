import React, { Suspense } from "react";
import { Box, Skeleton } from "@mui/material";
import { useIntersectionObserver } from "@/hooks/stock/useIntersectionObserver";

interface LazyChartProps {
  children: React.ReactNode;
  height?: number | string;
  minHeight?: number | string;
  threshold?: number;
  rootMargin?: string;
  forceRender?: boolean;
}

export const LazyChart: React.FC<LazyChartProps> = ({
  children,
  height = "auto",
  minHeight = "250px",
  threshold = 0.1,
  rootMargin = "100px",
  forceRender = false,
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  // Se forceRender for true, sempre renderiza (modo impressão)
  const shouldRender = forceRender || isVisible;

  return (
    <Box ref={ref} sx={{ minHeight: minHeight, width: "100%" }}>
      {shouldRender ? (
        <Suspense
          fallback={
            <Box
              sx={{
                width: "100%",
                height: height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height={height}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          }
        >
          {children}
        </Suspense>
      ) : (
        <Box
          sx={{
            width: "100%",
            minHeight: minHeight,
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height={height}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      )}
    </Box>
  );
};
