import React, { useRef, useMemo, useId, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts, { ApexOptions } from "apexcharts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Stack,
} from "@mui/material";
import ExportChartOrIndicator, {
  ExportMode,
} from "@/components/exports/ExportChartOrIndicator";

interface SeriesData {
  name: string;
  data: number[];
}

interface StackColumnsProps {
  title?: string;
  subTitle?: string;
  series: SeriesData[];
  categories: string[];
  height?: number | string;
  colors?: string[];
  showDataLabels?: boolean;
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  horizontal?: boolean;
  borderRadius?: number;
  showToolbar?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  legendPositionHorizontal?: "left" | "center" | "right";
  showBarNumbers?: boolean;
  colorsValueBar?: string[];
  stacked?: boolean;
  columnWidth?: string | number;
  barHeight?: string | number;
  legendFontSize?: string;
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
  heightCard?: string | number;
  formatTooltipValue?: (value: number) => string;
  formatYAxisValue?: (value: number) => string;
}

const StackColumns: React.FC<StackColumnsProps> = ({
  title = "Gráfico de Colunas Empilhadas",
  subTitle,
  series,
  categories,
  height = 350,
  colors = ["#07A7DF", "#17D6A3", "#FFC107", "#FF6B6B", "#6C5CE7", "#A0A0A0"],
  colorsValueBar = ["#fff"],
  showDataLabels = true,
  showLegend = true,
  legendPosition = "right",
  horizontal = false,
  borderRadius = 10,
  showToolbar = false,
  isLoading = false,
  isError = false,
  errorMessage = "Erro ao carregar o gráfico. Tente novamente.",
  legendPositionHorizontal = "center",
  showBarNumbers = false,
  stacked = true,
  columnWidth,
  barHeight,
  legendFontSize = "18px",
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
  heightCard = "100%",
  formatTooltipValue,
  formatYAxisValue,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uid = useId();
  const chartIdRef = useRef<string>(
    `stack_${uid.replace(/:/g, "")}_${Math.random().toString(36).slice(2, 9)}`,
  );

  // Key that forces ReactApexChart to fully remount when data shape changes.
  // This prevents the ApexCharts internal promise race that causes:
  // "t3.hasOwnProperty is not a function" / "dom.Paper is undefined"
  const apexChartKey = useMemo(() => {
    const seriesKey =
      series?.map((s) => `${s.name}:${s.data?.length ?? 0}`).join("|") ?? "";
    const catKey = categories?.join(",") ?? "";
    return `${chartIdRef.current}||${seriesKey}||${catKey}`;
  }, [series, categories]);

  // Visibility gate: when apexChartKey changes, briefly unmount the chart so the
  // old ApexCharts instance fully destroys itself (dom.Paper cleaned up) before
  // the new instance initialises. Without this, componentDidUpdate on the old
  // instance fires in the same React batch as the new mount → crash.
  const [chartVisible, setChartVisible] = useState(false);
  useEffect(() => {
    setChartVisible(false);
    const timer = setTimeout(() => setChartVisible(true), 80);
    return () => {
      clearTimeout(timer);
      setChartVisible(false);
    };
  }, [apexChartKey]);

  const totalCategories = categories?.length || 0;
  const colBase = (() => {
    if (typeof columnWidth === "number") return columnWidth;
    if (typeof columnWidth === "string") {
      const n = parseInt(columnWidth, 10);
      return isNaN(n) ? 30 : n;
    }
    return 30;
  })();
  const gapApprox = 24;
  const minChartWidth =
    totalCategories > 8 ? totalCategories * (colBase + gapApprox) : undefined;

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
      <Box
        sx={{
          width: "100%",
          overflowX: minChartWidth ? "auto" : "visible",
          overflowY: "hidden",
          height: typeof height === "number" ? `${height}px` : height,
        }}
        ref={containerRef}
      >
        <Box sx={{ minWidth: minChartWidth ? `${minChartWidth}px` : "100%" }}>
          <ReactApexChart
            key={apexChartKey}
            options={options}
            series={series}
            type="bar"
            height={
              typeof height === "number"
                ? `${height - 5}px`
                : `calc(${height} - 5px)`
            }
          />
        </Box>
      </Box>
    );
  };

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: height,
        stacked: stacked,
        id: chartIdRef.current,
        toolbar: {
          show: showToolbar,
        },
        zoom: {
          enabled: true,
        },
        animations: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: showBarNumbers,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: colorsValueBar,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: horizontal,
          borderRadius: borderRadius,
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "last",
          columnWidth: columnWidth,
          barHeight: barHeight,
          dataLabels: {
            total: {
              enabled: showDataLabels && showBarNumbers,
              style: {
                fontSize: "13px",
                fontWeight: 900,
              },
            },
          },
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: "#71717A",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#71717A",
            fontSize: "12px",
          },
          formatter: formatYAxisValue
            ? (value: number) => formatYAxisValue(value)
            : undefined,
        },
      },
      legend: {
        show: showLegend,
        position: legendPosition,
        horizontalAlign: legendPositionHorizontal
          ? legendPositionHorizontal
          : "center",
        offsetY: legendPosition === "right" ? 40 : 0,
        fontSize: legendFontSize,
        labels: {
          colors: "#71717A",
        },
      },
      fill: {
        opacity: 1,
      },
      colors: colors,
      grid: {
        borderColor: "#F4F4F4",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "light",
        style: {
          fontSize: "12px",
        },
        y: {
          formatter: formatTooltipValue
            ? (value: number) => formatTooltipValue(value)
            : undefined,
        },
      },
    }),
    [
      height,
      stacked,
      showToolbar,
      showBarNumbers,
      colorsValueBar,
      horizontal,
      borderRadius,
      columnWidth,
      showDataLabels,
      categories,
      showLegend,
      legendPosition,
      legendPositionHorizontal,
      colors,
      formatTooltipValue,
      formatYAxisValue,
    ],
  );

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
      <CardContent
        sx={{
          flexDirection: "column",
          display: "flex",
          height: !isError && !isLoading ? "100%" : "auto",
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
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
          {exportEnabled && !isLoading && !isError && series?.length > 0 && (
            <ExportChartOrIndicator
              modes={exportModes}
              filename={
                exportFilename || (title ? title.replace(/\s+/g, "-") : "chart")
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

        {subTitle && (
          <Typography
            variant="body2"
            sx={{ color: "#71717A", mb: "10px", lineHeight: 1 }}
          >
            {subTitle}
          </Typography>
        )}

        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default React.memo(StackColumns);
