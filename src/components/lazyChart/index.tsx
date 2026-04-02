import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

interface LazyChartProps {
  children: React.ReactNode;
  height: number;
}

export const LazyChart = ({ children, height }: LazyChartProps) => {
  const style = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (style.current) {
        style.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <Box
      ref={style}
      sx={{
        height: height,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        bgcolor: "background.paper",
        boxShadow:
          "0px 1px 3px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(0, 0, 0, 0.12)",
      }}
    >
      {children}
    </Box>
  );
};

LazyChart.displayName = "LazyChart";
