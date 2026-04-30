import React, { useRef, useMemo, useState, useCallback } from "react";
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

export interface StackSeriesData {
  name: string;
  data: number[];
}

export interface StackColumnsEChartsProps {
  title?: string;
  subTitle?: string;
  series: StackSeriesData[];
  categories: string[];
  height?: number | string;
  colors?: string[];
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  legendAlign?: "left" | "center" | "right";
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  heightCard?: string | number;
  // Bar config
  barWidth?: string | number;
  barBorderRadius?: number | number[];
  barGap?: string | number;
  barCategoryGap?: string | number;
  // Stack config
  stack?: string;
  // Axis config
  xAxisLabelRotate?: number;
  xAxisLabelFontSize?: number;
  yAxisLabelFontSize?: number;
  xAxisLabelColor?: string;
  yAxisLabelColor?: string;
  // Grid config
  gridTop?: string | number;
  gridBottom?: string | number;
  gridLeft?: string | number;
  gridRight?: string | number;
  // Tooltip config
  showTooltip?: boolean;
  tooltipTrigger?: "item" | "axis" | "none";
  // Animation
  enableAnimation?: boolean;
  animationDuration?: number;
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
  // Legend styling
  legendTop?: string | number;
  legendLeft?: string | number;
  legendItemGap?: number;
  legendTextColor?: string;
  legendFontSize?: number;
  // Orientation / stack
  horizontal?: boolean;
  stacked?: boolean;
  // Data labels (inside bars)
  showDataLabels?: boolean;
  dataLabelColor?: string;
  dataLabelFontSize?: number;
  // Grid containLabel
  containLabel?: boolean;
  // Custom formatters
  tooltipFormatter?: (params: any) => string;
  yAxisLabelFormatter?: (value: number) => string;
}

const StackColumnsECharts: React.FC<StackColumnsEChartsProps> = ({
  title = "",
  subTitle,
  series = [],
  categories = [],
  height = 350,
  colors = ["#FF3538", "#FFE6E7"],
  showLegend = true,
  legendPosition = "top",
  legendAlign = "left",
  isLoading = false,
  isError = false,
  errorMessage = "Erro ao carregar o gráfico. Tente novamente.",
  heightCard = "100%",
  barWidth = "auto",
  barBorderRadius = [5, 5, 0, 0],
  barGap = "10%",
  barCategoryGap = "30%",
  stack = "total",
  xAxisLabelRotate = 0,
  xAxisLabelFontSize = 12,
  yAxisLabelFontSize = 12,
  xAxisLabelColor = "#71717A",
  yAxisLabelColor = "#71717A",
  gridTop = 60,
  gridBottom = 30,
  gridLeft = 50,
  gridRight = 20,
  showTooltip = true,
  tooltipTrigger = "axis",
  enableAnimation = true,
  animationDuration = 400,
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
  legendTop = 10,
  legendLeft = "left",
  legendItemGap = 15,
  legendTextColor = "#71717A",
  legendFontSize = 12,
  horizontal = false,
  stacked = true,
  showDataLabels = false,
  dataLabelColor = "#fff",
  dataLabelFontSize = 12,
  containLabel = false,
  tooltipFormatter,
  yAxisLabelFormatter,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReactECharts>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (el) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const h = Math.floor(entry.contentRect.height);
          if (h > 0) setMeasuredHeight(h);
        }
      });
      ro.observe(el);
      roRef.current = ro;
    }
  }, []);

  const option: EChartsOption = useMemo(
    () => ({
      color: colors,
      tooltip: {
        trigger: tooltipTrigger,
        show: showTooltip,
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#E4E4E7",
        borderWidth: 1,
        textStyle: {
          color: "#333",
          fontSize: 12,
        },
        formatter: tooltipFormatter,
      },
      legend: {
        show: showLegend,
        top: legendTop,
        left:
          legendAlign === "left"
            ? "left"
            : legendAlign === "right"
              ? "right"
              : "center",
        orient:
          legendPosition === "top" || legendPosition === "bottom"
            ? "horizontal"
            : "vertical",
        itemGap: legendItemGap,
        textStyle: {
          color: legendTextColor,
          fontSize: legendFontSize,
        },
        itemWidth: 14,
        itemHeight: 14,
      },
      grid: {
        top: gridTop,
        bottom: gridBottom,
        left: gridLeft,
        right: gridRight,
        containLabel: containLabel,
      },
      xAxis: horizontal
        ? {
            type: "value",
            axisLabel: {
              color: xAxisLabelColor,
              fontSize: xAxisLabelFontSize,
              formatter: yAxisLabelFormatter
                ? (value: any) => yAxisLabelFormatter(value)
                : undefined,
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: {
              lineStyle: { color: "#F4F4F4", type: "dashed" },
            },
          }
        : {
            type: "category",
            data: categories,
            axisLabel: {
              rotate: xAxisLabelRotate,
              color: xAxisLabelColor,
              fontSize: xAxisLabelFontSize,
            },
            axisLine: { lineStyle: { color: "#E4E4E7" } },
            axisTick: { show: false },
          },
      yAxis: horizontal
        ? {
            type: "category",
            data: categories,
            axisLabel: {
              color: yAxisLabelColor,
              fontSize: yAxisLabelFontSize,
            },
            axisLine: { lineStyle: { color: "#E4E4E7" } },
            axisTick: { show: false },
          }
        : {
            type: "value",
            axisLabel: {
              color: yAxisLabelColor,
              fontSize: yAxisLabelFontSize,
              formatter: yAxisLabelFormatter
                ? (value: any) => yAxisLabelFormatter(value)
                : undefined,
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: {
              lineStyle: { color: "#F4F4F4", type: "dashed" },
            },
          },
      series: series.map((s) => ({
        name: s.name,
        type: "bar",
        ...(stacked ? { stack } : {}),
        data: s.data,
        barWidth: barWidth,
        itemStyle: {
          borderRadius: horizontal
            ? [
                0,
                Array.isArray(barBorderRadius)
                  ? barBorderRadius[1]
                  : barBorderRadius,
                Array.isArray(barBorderRadius)
                  ? barBorderRadius[1]
                  : barBorderRadius,
                0,
              ]
            : barBorderRadius,
        },
        label: {
          show: showDataLabels,
          position: "inside",
          color: dataLabelColor,
          fontSize: dataLabelFontSize,
          fontWeight: 600,
          formatter: (params: any) =>
            params.value === 0 || params.value === null
              ? ""
              : `${params.value}`,
        },
        barGap: barGap,
        barCategoryGap: barCategoryGap,
      })),
      animation: enableAnimation,
      animationDuration: animationDuration,
    }),
    [
      colors,
      tooltipTrigger,
      showTooltip,
      tooltipFormatter,
      showLegend,
      legendTop,
      legendLeft,
      legendPosition,
      legendItemGap,
      legendTextColor,
      legendFontSize,
      gridTop,
      gridBottom,
      gridLeft,
      gridRight,
      categories,
      xAxisLabelRotate,
      xAxisLabelColor,
      xAxisLabelFontSize,
      yAxisLabelColor,
      yAxisLabelFontSize,
      yAxisLabelFormatter,
      series,
      stack,
      barWidth,
      barBorderRadius,
      barGap,
      barCategoryGap,
      enableAnimation,
      animationDuration,
      horizontal,
      stacked,
      showDataLabels,
      dataLabelColor,
      dataLabelFontSize,
      containLabel,
    ],
  );

  const getImageData = async (): Promise<string> => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      return echartsInstance.getDataURL({
        type: "png",
        pixelRatio: exportRasterScale || 2,
        backgroundColor: "#fff",
      });
    }
    return "";
  };

  const getSvgElement = (): SVGSVGElement | null => {
    if (containerRef.current) {
      return containerRef.current.querySelector("svg") as SVGSVGElement | null;
    }
    return null;
  };

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

    // When horizontal, the container stretches via flex:1 and we measure its
    // real pixel height before rendering ECharts, so it never gets height:0.
    const chartStyle = horizontal
      ? {
          height: measuredHeight > 0 ? `${measuredHeight}px` : "100%",
          width: "100%",
        }
      : {
          height: typeof height === "number" ? `${height}px` : height,
          width: "100%",
        };

    return (
      <Box
        ref={setContainerRef}
        sx={{
          width: "100%",
          ...(horizontal
            ? { flex: 1, minHeight: 0 }
            : { height: typeof height === "number" ? `${height}px` : height }),
        }}
      >
        {(!horizontal || measuredHeight > 0) && (
          <ReactECharts
            ref={chartRef}
            option={option}
            style={chartStyle}
            notMerge={true}
            lazyUpdate={true}
          />
        )}
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
        transition: "all 0.3s ease",
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
              getImageData={getImageData}
              getSvgElement={getSvgElement}
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

export default React.memo(StackColumnsECharts, (prevProps, nextProps) => {
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
