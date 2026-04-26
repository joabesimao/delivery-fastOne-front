import React, { useRef, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
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

export interface SeriesData {
  name: string;
  data: (number | null)[];
  stack?: string;
  smooth?: boolean;
  areaStyle?: any;
}

export interface LineChartEChartsProps {
  title?: string;
  subTitle?: string;
  series?: SeriesData[];
  categories?: string[];
  colors?: string[];
  height?: number | string;
  width?: number | string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  heightCard?: string | number;

  // Legend configuration
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  legendOrient?: "horizontal" | "vertical";

  // Grid configuration
  gridLeft?: string;
  gridRight?: string;
  gridTop?: string;
  gridBottom?: string;
  gridContainLabel?: boolean;

  // Line configuration
  smooth?: boolean;
  showSymbol?: boolean;
  symbolSize?: number;
  lineWidth?: number;

  // Area fill
  showArea?: boolean;
  areaOpacity?: number;

  // Stack configuration
  stack?: boolean;
  stackName?: string;

  // Axis configuration
  xAxisLabel?: string;
  yAxisLabel?: string;
  yMin?: number;
  yMax?: number;
  xAxisLabelRotate?: number;
  boundaryGap?: boolean;

  // Tooltip configuration
  showTooltip?: boolean;
  tooltipTrigger?: "axis" | "item" | "none";

  // Toolbox (export)
  showToolbox?: boolean;

  // Animation
  enableAnimation?: boolean;
  animationDuration?: number;

  // Card styling
  cardPadding?: number | string;

  // Export options
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

  // Y-axis formatter
  yAxisFormatter?: (value: number) => string;
  tooltipValueFormatter?: (value: number) => string;

  // Message when no data
  messageDefault?: string;
}

const defaultColors = [
  "#17D6A3",
  "#FF6B6B",
  "#FFC107",
  "#07A7DF",
  "#6C5CE7",
  "#A0A0A0",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const LineChartECharts: React.FC<LineChartEChartsProps> = ({
  title = "",
  subTitle = "",
  series = [],
  categories = [],
  colors = defaultColors,
  height = 350,
  width = "100%",
  isLoading = false,
  isError = false,
  errorMessage = "Erro ao carregar o gráfico. Tente novamente.",
  heightCard = "auto",

  showLegend = true,
  legendPosition = "top",
  legendOrient = "horizontal",

  gridLeft = "3%",
  gridRight = "4%",
  gridTop = "15%",
  gridBottom = "3%",
  gridContainLabel = true,

  smooth = true,
  showSymbol = true,
  symbolSize = 8,
  lineWidth = 3,

  showArea = false,
  areaOpacity = 0.3,

  stack = false,
  stackName = "Total",

  xAxisLabel = "",
  yAxisLabel = "",
  yMin,
  yMax,
  xAxisLabelRotate = 0,
  boundaryGap = false,

  showTooltip = true,
  tooltipTrigger = "axis",

  showToolbox = false,

  enableAnimation = true,
  animationDuration = 1000,

  cardPadding = 2,

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

  yAxisFormatter,
  tooltipValueFormatter,

  messageDefault = "Nenhum dado disponível para exibir.",
}) => {
  const chartRef = useRef<ReactECharts>(null);

  const getLegendPosition = () => {
    const positionMap: Record<string, any> = {
      top: { top: "5%", left: "left" },
      bottom: { bottom: "5%", left: "center" },
      left: { left: "5%", top: "middle", orient: "vertical" },
      right: { right: "5%", top: "middle", orient: "vertical" },
    };
    return positionMap[legendPosition] || positionMap.top;
  };

  const option: EChartsOption = useMemo(
    () => ({
      color: colors,
      title: {
        show: false,
      },
      tooltip: showTooltip
        ? {
            trigger: tooltipTrigger,
            axisPointer: {
              type: tooltipTrigger === "axis" ? "line" : "shadow",
            },
            formatter: tooltipValueFormatter
              ? (params: any) => {
                  if (Array.isArray(params)) {
                    let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
                    params.forEach((param) => {
                      const value = tooltipValueFormatter(param.value);
                      tooltip += `${param.marker} ${param.seriesName}: ${value}<br/>`;
                    });
                    return tooltip;
                  }
                  return `${params.marker} ${params.seriesName}: ${tooltipValueFormatter(params.value)}`;
                }
              : undefined,
          }
        : undefined,
      legend: showLegend
        ? {
            ...getLegendPosition(),
            orient: legendOrient,
            textStyle: {
              color: "#71717A",
              fontSize: 12,
            },
            itemWidth: 14,
            itemHeight: 14,
            itemGap: 16,
          }
        : {
            show: false,
          },
      grid: {
        left: gridLeft,
        right: gridRight,
        top: gridTop,
        bottom: gridBottom,
        containLabel: gridContainLabel,
      },
      toolbox: showToolbox
        ? {
            feature: {
              saveAsImage: {
                title: "Salvar como imagem",
                name: exportFilename || title || "grafico",
              },
            },
            right: "5%",
            top: "5%",
          }
        : undefined,
      xAxis: {
        type: "category",
        boundaryGap: boundaryGap,
        data: categories,
        name: xAxisLabel,
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          color: "#64748B",
          fontSize: 12,
          fontWeight: 500,
        },
        axisLabel: {
          color: "#64748B",
          fontSize: 11,
          rotate: xAxisLabelRotate,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: "#E5E7EB",
          },
        },
      },
      yAxis: {
        type: "value",
        name: yAxisLabel,
        nameLocation: "middle",
        nameGap: 50,
        nameTextStyle: {
          color: "#64748B",
          fontSize: 12,
          fontWeight: 500,
        },
        min: yMin,
        max: yMax,
        axisLabel: {
          color: "#64748B",
          fontSize: 11,
          formatter: yAxisFormatter || ((value: number) => value.toString()),
        },
        splitLine: {
          lineStyle: {
            color: "#F1F5F9",
            type: "dashed",
          },
        },
      },
      series: series.map((item) => ({
        name: item.name,
        type: "line",
        data: item.data,
        smooth: item.smooth !== undefined ? item.smooth : smooth,
        symbol: showSymbol ? "circle" : "none",
        symbolSize: symbolSize,
        lineStyle: {
          width: lineWidth,
        },
        stack: stack ? item.stack || stackName : undefined,
        areaStyle:
          item.areaStyle !== undefined
            ? item.areaStyle
            : showArea
              ? { opacity: areaOpacity }
              : undefined,
        emphasis: {
          focus: "series",
          scale: true,
          scaleSize: 10,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: "#fff",
        },
      })),
      animation: enableAnimation,
      animationDuration: animationDuration,
      animationEasing: "cubicOut",
    }),
    [
      colors,
      showTooltip,
      tooltipTrigger,
      tooltipValueFormatter,
      showLegend,
      legendPosition,
      legendOrient,
      gridLeft,
      gridRight,
      gridTop,
      gridBottom,
      gridContainLabel,
      showToolbox,
      categories,
      xAxisLabel,
      xAxisLabelRotate,
      boundaryGap,
      yAxisLabel,
      yMin,
      yMax,
      yAxisFormatter,
      series,
      smooth,
      showSymbol,
      symbolSize,
      lineWidth,
      stack,
      stackName,
      showArea,
      areaOpacity,
      enableAnimation,
      animationDuration,
      exportFilename,
      title,
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
          {messageDefault}
        </Typography>
      );
    }

    return (
      <Box sx={{ width: "100%" }}>
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width,
          }}
          opts={{ renderer: "svg" }}
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
        transition: "all 0.3s ease",
        height: heightCard,
      }}
    >
      <CardContent sx={{ p: cardPadding }}>
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
                  if (!chartRef.current) return "";
                  const instance = chartRef.current.getEchartsInstance();
                  return instance.getDataURL({
                    type: "png",
                    pixelRatio: 2,
                    backgroundColor: "#fff",
                  });
                }}
                getSvgElement={() => {
                  if (!chartRef.current) return null;
                  const instance = chartRef.current.getEchartsInstance();
                  const svgStr = instance.renderToSVGString();
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(svgStr, "image/svg+xml");
                  return doc.documentElement as unknown as SVGSVGElement;
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

export default React.memo(LineChartECharts, (prevProps, nextProps) => {
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
