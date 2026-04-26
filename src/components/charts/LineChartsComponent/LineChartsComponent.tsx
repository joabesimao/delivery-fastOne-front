import React, { useEffect, useRef, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts, { ApexOptions } from "apexcharts";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ExportChartOrIndicator, {
  ExportMode,
} from "@/components/exports/ExportChartOrIndicator";

interface SeriesData {
  name: string;
  data: number[];
}

interface LineChartsComponentProps {
  title?: string;
  subTitle?: string;
  series?: SeriesData[];
  categories?: string[];
  colors?: string[];
  enableDownload?: boolean;
  straightLines?: boolean;
  strokeWidth?: number;
  markerSize?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  height?: number | string;
  singleLineGradient?: boolean;
  gradientOpacityFrom?: number;
  gradientOpacityTo?: number;
  gradientShadeIntensity?: number;
  yMin?: number;
  yMax?: number;
  yTitle?: string;
  xTitle?: string;
  yLabelFormatter?: (val: number) => string;
  isPercent?: boolean;
  percentDecimals?: number;
  heightCard?: number | string;
  // Export props
  exportEnabled?: boolean;
  exportFilename?: string;
  exportModes?: ExportMode[];
  exportCsvHeaders?: string[];
  exportCsvRows?: Array<Array<string | number>>;
  exportCsvRecords?: Array<Record<string, any>>;
  exportPdfDpi?: number;
  exportPdfMarginMm?: number;
  exportPdfMaxWidthMm?: number;
  exportRasterScale?: number;
  exportPdfOrientation?: "portrait" | "landscape";
}

const generateAutomaticColors = (seriesCount: number): string[] => {
  const baseColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#EC4899",
    "#6B7280",
    "#84CC16",
    "#F472B6",
    "#14B8A6",
  ];

  if (seriesCount <= baseColors.length) return baseColors.slice(0, seriesCount);

  const colors = [...baseColors];
  const additionalColors = seriesCount - baseColors.length;
  for (let i = 0; i < additionalColors; i++) {
    const hue = (360 / additionalColors) * i;
    const saturation = 70 + (i % 3) * 10;
    const lightness = 45 + (i % 4) * 5;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

const LineChartsComponent: React.FC<LineChartsComponentProps> = ({
  title,
  subTitle,
  series = [],
  categories = [],
  colors,
  enableDownload = true,
  straightLines = true,
  strokeWidth = 3,
  markerSize = 6,
  showLegend = true,
  height = 350,
  isLoading = false,
  isError = false,
  errorMessage = "Erro ao carregar o gráfico. Tente novamente.",
  singleLineGradient = false,
  gradientOpacityFrom = 0.8,
  gradientOpacityTo = 0.25,
  gradientShadeIntensity = 0.7,
  yMin = 0,
  yMax = 100,
  yTitle = "",
  xTitle = "",
  yLabelFormatter,
  isPercent = false,
  percentDecimals = 0,
  heightCard,
  exportEnabled = false,
  exportFilename,
  exportModes = ["pdf"],
  exportCsvHeaders,
  exportCsvRows,
  exportCsvRecords,
  exportPdfDpi = 96,
  exportPdfMarginMm = 10,
  exportPdfMaxWidthMm = 270,
  exportRasterScale = 1,
  exportPdfOrientation = "landscape",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartIdRef = useRef<string>(
    `line_${Math.random().toString(36).slice(2, 9)}`,
  );
  const chartColors = useMemo(
    () => colors || generateAutomaticColors(series.length),
    [colors, series.length],
  );
  const enableGradient = useMemo(
    () => singleLineGradient && series.length === 1,
    [singleLineGradient, series.length],
  );

  // Key that forces ReactApexChart to fully remount when series/categories shape changes.
  // Prevents the ApexCharts internal promise race that causes:
  // "t3.hasOwnProperty is not a function" / "dom.Paper is undefined"
  const apexChartKey = useMemo(() => {
    const seriesKey =
      series
        ?.map(
          (s) => `${s.name}:${s.data?.length ?? 0}:${s.data?.join(",") ?? ""}`,
        )
        .join("|") ?? "";
    const catKey = categories?.join(",") ?? "";
    return `${chartIdRef.current}||${seriesKey}||${catKey}`;
  }, [series, categories]);

  const [chartVisible, setChartVisible] = useState(false);
  useEffect(() => {
    setChartVisible(false);
    const timer = setTimeout(() => setChartVisible(true), 80);
    return () => {
      clearTimeout(timer);
      setChartVisible(false);
    };
  }, [apexChartKey]);

  // Reflow chart on print to avoid clipping when viewport and print widths differ
  useEffect(() => {
    const before = () => {
      try {
        const el = containerRef.current as HTMLDivElement | null;
        const targetW = el?.clientWidth;
        const targetH =
          typeof height === "number"
            ? height
            : Number.parseInt(String(height ?? 350), 10) || 350;
        // Disable animations and set explicit dimensions to current container
        ApexCharts.exec(
          chartIdRef.current,
          "updateOptions",
          {
            chart: {
              animations: { enabled: false },
              width: targetW,
              height: targetH,
            },
          },
          false,
          true,
        );
        // Nudge Apex to recompute layout
        window.dispatchEvent(new Event("resize"));
      } catch {}
    };
    const after = () => {
      try {
        ApexCharts.exec(chartIdRef.current, "updateOptions", {}, false, true);
        ApexCharts.exec(
          chartIdRef.current,
          "updateSeries",
          series as any,
          true,
        );
        window.dispatchEvent(new Event("resize"));
      } catch {}
    };
    const mql = window.matchMedia && window.matchMedia("print");
    let mqlHandler: any;
    if (mql) {
      mqlHandler = (e: MediaQueryListEvent) => (e.matches ? before() : after());
      if (typeof mql.addEventListener === "function")
        mql.addEventListener("change", mqlHandler);
      else if (typeof (mql as any).addListener === "function")
        (mql as any).addListener(mqlHandler);
    }
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      if (mql && mqlHandler) {
        try {
          if (typeof mql.removeEventListener === "function")
            mql.removeEventListener("change", mqlHandler);
          else if (typeof (mql as any).removeListener === "function")
            (mql as any).removeListener(mqlHandler);
        } catch {}
      }
    };
  }, [series]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        height: height as number,
        type: enableGradient ? "area" : "line",
        id: chartIdRef.current,
        zoom: { enabled: true },
        toolbar: {
          show: enableDownload,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: enableDownload,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
          export: {
            csv: {
              filename: title || "grafico",
              columnDelimiter: ",",
              headerCategory: "category",
              headerValue: "value",
            },
            svg: { filename: title || "grafico" },
            png: { filename: title || "grafico" },
          },
        },
        background: "transparent",
        animations: {
          enabled: true,
          speed: 400,
          animateGradually: {
            enabled: true,
            delay: 100,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 250,
          },
        },
      },
      colors: chartColors,
      dataLabels: { enabled: false },
      stroke: {
        curve: straightLines ? "straight" : "smooth",
        width: strokeWidth,
        colors: chartColors,
      },
      grid: {
        borderColor: "#F1F5F9",
        strokeDashArray: 2,
        row: { colors: ["transparent"], opacity: 0.5 },
      },
      markers: {
        size: markerSize,
        colors: chartColors,
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: markerSize + 2 },
      },
      fill: enableGradient
        ? {
            type: "gradient",
            gradient: {
              shade: "light",
              shadeIntensity: gradientShadeIntensity,
              type: "vertical",
              inverseColors: false,
              opacityFrom: gradientOpacityFrom,
              opacityTo: gradientOpacityTo,
              stops: [0, 90, 100],
            },
            colors: [chartColors[0]],
          }
        : { colors: chartColors },
      xaxis: {
        categories,
        title: {
          text: xTitle,
          style: { color: "#64748B", fontSize: "12px", fontWeight: 500 },
        },
        labels: { style: { colors: "#64748B", fontSize: "11px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        title: {
          text: yTitle,
          style: { color: "#64748B", fontSize: "12px", fontWeight: 500 },
        },
        min: yMin,
        max: yMax,
        labels: {
          style: { colors: "#64748B", fontSize: "11px" },
          formatter: function (val) {
            if (typeof yLabelFormatter === "function")
              return yLabelFormatter(val);
            const num = typeof val === "number" ? val : Number(val);
            if (!isFinite(num)) return `${val}`;
            return isPercent
              ? `${num.toFixed(percentDecimals)}%`
              : num.toFixed(1);
          },
        },
      },
      legend: {
        show: showLegend,
        showForSingleSeries: true,
        position: "top",
        horizontalAlign: "left",
        floating: false,
        fontSize: "12px",
        fontWeight: 400,
        offsetY: 0,
        offsetX: 0,
        labels: { colors: "#374151", useSeriesColors: false },
        markers: { size: 8, strokeWidth: 0, shape: "square" },
        itemMargin: { horizontal: 8, vertical: 4 },
      },
      tooltip: {
        theme: "light",
        style: { fontSize: "12px" },
        y: {
          formatter: function (val) {
            const num = typeof val === "number" ? val : Number(val);
            if (!isFinite(num)) return `${val}`;
            return isPercent
              ? `${num.toFixed(percentDecimals)}%`
              : `${num.toFixed(1)} pts`;
          },
        },
        marker: { show: true },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            legend: { position: "bottom", horizontalAlign: "center" },
          },
        },
      ],
    }),
    [
      height,
      enableGradient,
      enableDownload,
      title,
      chartColors,
      straightLines,
      strokeWidth,
      markerSize,
      gradientShadeIntensity,
      gradientOpacityFrom,
      gradientOpacityTo,
      categories,
      xTitle,
      yTitle,
      yMin,
      yMax,
      yLabelFormatter,
      isPercent,
      percentDecimals,
      showLegend,
    ],
  );

  const renderContent = () => {
    if (isError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      );
    }

    if (isLoading) {
      return (
        <Box
          sx={{
            width: "100%",
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 1 }}
          />
        </Box>
      );
    }

    if (!series || series.length === 0) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          Nenhum dado disponível para exibir.
        </Typography>
      );
    }

    if (!chartVisible) {
      return (
        <Box
          sx={{
            width: "100%",
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 1 }}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%" }} ref={containerRef}>
        <ReactApexChart
          key={apexChartKey}
          options={chartOptions}
          series={series}
          type={enableGradient ? "area" : "line"}
          height={height}
        />
      </Box>
    );
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid #E4E4E7",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        width: "100%",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
        height: heightCard,
      }}
    >
      <CardContent sx={{ p: "20px" }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box>
            {title && (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: "1.1rem",
                  mb: subTitle ? 0 : 2,
                }}
              >
                {title}
              </Typography>
            )}
            {subTitle && (
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  color: "#71717A",
                  mb: "5px",
                  lineHeight: "1",
                }}
              >
                {subTitle}
              </Typography>
            )}
          </Box>
          {exportEnabled &&
            !isLoading &&
            !isError &&
            series &&
            series.length > 0 && (
              <ExportChartOrIndicator
                modes={exportModes}
                filename={
                  exportFilename ||
                  (title ? title.replace(/\s+/g, "-") : "chart")
                }
                title={title}
                subTitle={subTitle}
                tooltip="Exportar"
                getImageData={async () => {
                  const res = await ApexCharts.exec(
                    chartIdRef.current,
                    "dataURI",
                  );
                  return (res as any)?.imgURI as string;
                }}
                getSvgElement={() => {
                  const el = containerRef.current;
                  if (!el) return null;
                  return el.querySelector("svg");
                }}
                rasterScale={exportRasterScale}
                csvHeaders={exportCsvHeaders}
                csvRows={exportCsvRows}
                csvRecords={exportCsvRecords}
                pdfDpi={exportPdfDpi}
                pdfMarginMm={exportPdfMarginMm}
                pdfMaxWidthMm={exportPdfMaxWidthMm}
                pdfOrientation={exportPdfOrientation}
              />
            )}
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(LineChartsComponent, (prevProps, nextProps) => {
  return (
    prevProps.series === nextProps.series &&
    prevProps.categories === nextProps.categories &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isError === nextProps.isError &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.colors === nextProps.colors
  );
});
