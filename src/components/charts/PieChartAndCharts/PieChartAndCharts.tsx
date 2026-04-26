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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ExportChartOrIndicator, {
  ExportMode,
} from "@/components/exports/ExportChartOrIndicator";

export interface ChartData {
  name: string;
  value: number;
}

export interface PieChartEChartsProps {
  title?: string;
  subTitle?: string;
  data: ChartData[];
  height?: number | string;
  width?: number | string;
  colors?: string[];
  type?: "pie" | "donut";

  // Center configuration
  showCenter?: boolean;
  centerText?: string;
  centerSubText?: string;
  centerTextFontSize?: number | string;
  centerSubTextFontSize?: number | string;
  centerTextColor?: string;
  centerSubTextColor?: string;
  centerTextFontWeight?: number | string;
  centerSubTextFontWeight?: number | string;

  // Legend configuration
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  legendOrient?: "horizontal" | "vertical";
  legendItemWidth?: number;
  legendItemHeight?: number;
  legendItemGap?: number;
  legendTop?: string | number;
  legendLeft?: string | number;
  legendRight?: string | number;
  legendBottom?: string | number;

  // Donut configuration
  radius?: [string, string];
  innerRadius?: string;
  outerRadius?: string;

  // Label configuration
  showLabels?: boolean;
  labelPosition?: "outside" | "inside" | "center";
  labelFormatter?: string | ((params: any) => string);

  // Loading and error states
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  messageDefault?: string;

  // Card configuration
  heightCard?: string | number;
  cardPadding?: number | string;
  sizeCircularSkeleton?: number | string;

  // Export configuration
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

  // Tooltip configuration
  showTooltip?: boolean;
  tooltipFormatter?: string | ((params: any) => string);

  // Additional options
  showPercent?: boolean;
  itemShowCenter?: string;
}

const defaultColors = [
  "#17D6A3",
  "#FF6B6B",
  "#FFC107",
  "#07A7DF",
  "#6C5CE7",
  "#A0A0A0",
];

const PieChartECharts: React.FC<PieChartEChartsProps> = ({
  title = "",
  subTitle = "",
  data,
  height = 350,
  width = "100%",
  colors = defaultColors,
  type = "donut",

  showCenter = true,
  centerText,
  centerSubText,
  centerTextFontSize = 32,
  centerSubTextFontSize = 14,
  centerTextColor = "#111827",
  centerSubTextColor = "#6B7280",
  centerTextFontWeight = "bold",
  centerSubTextFontWeight = 600,

  showLegend = true,
  legendPosition = "right",
  legendOrient = "vertical",
  legendItemWidth = 12,
  legendItemHeight = 12,
  legendItemGap = 10,
  legendTop,
  legendLeft,
  legendRight,
  legendBottom,

  radius,
  innerRadius = "60%",
  outerRadius = "80%",

  showLabels = false,
  labelPosition = "outside",
  labelFormatter,

  isLoading = false,
  isError = false,
  errorMessage = "Erro ao carregar o gráfico. Tente novamente.",
  messageDefault = "Nenhum dado encontrado",

  heightCard = "auto",
  cardPadding = 2,
  sizeCircularSkeleton = "125px",

  exportEnabled = false,
  exportFilename = "grafico-pizza",
  exportModes = ["pdf"],
  exportCsvHeaders,
  exportCsvRows,
  exportCsvRecords,
  exportPdfDpi,
  exportPdfMarginMm,
  exportPdfMaxWidthMm,
  exportRasterScale,
  exportPdfOrientation = "portrait",

  showTooltip = true,
  tooltipFormatter,

  showPercent = true,
  itemShowCenter,
}) => {
  const chartRef = useRef<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const totalValue = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  const selectItemShowCenter = itemShowCenter || centerSubText;
  const centerCategoryValue = useMemo(() => {
    if (!selectItemShowCenter) return 0;
    return data.find((d) => d.name === selectItemShowCenter)?.value ?? 0;
  }, [data, selectItemShowCenter]);

  const computedCenterText = useMemo(() => {
    if (centerText) return centerText;

    if (showPercent) {
      if (totalValue === 0) return "0%";
      const percentage =
        ((centerCategoryValue || totalValue) / totalValue) * 100;
      return `${Math.round(percentage)}%`;
    }

    return totalValue.toString();
  }, [centerText, showPercent, centerCategoryValue, totalValue]);

  const computedCenterSubText = useMemo(() => {
    return centerSubText || (showPercent ? "" : "Total");
  }, [centerSubText, showPercent]);

  const chartRadius = useMemo(() => {
    if (radius) return radius;
    if (type === "donut") {
      return [innerRadius, outerRadius];
    }
    return ["0%", outerRadius];
  }, [radius, type, innerRadius, outerRadius]);

  const option: EChartsOption = useMemo(
    () => ({
      color: colors,
      tooltip: showTooltip
        ? {
            trigger: "item",
            formatter:
              tooltipFormatter ||
              ((params: any) => {
                const percent = params.percent.toFixed(1);
                return `${params.name}<br/>${params.value} (${percent}%)`;
              }),
          }
        : undefined,
      legend: showLegend
        ? {
            orient: legendOrient,
            [legendPosition]: 10,
            ...(legendTop !== undefined && { top: legendTop }),
            ...(legendLeft !== undefined && { left: legendLeft }),
            ...(legendRight !== undefined && { right: legendRight }),
            ...(legendBottom !== undefined && { bottom: legendBottom }),
            itemWidth: legendItemWidth,
            itemHeight: legendItemHeight,
            itemGap: legendItemGap,
            textStyle: {
              color: "#71717A",
              fontSize: 12,
            },
            icon: "rect",
          }
        : undefined,
      series: [
        {
          type: "pie",
          radius: chartRadius,
          center: ["50%", "50%"],
          data: data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: colors[index % colors.length],
            },
          })),
          avoidLabelOverlap: true,
          label: {
            show: showCenter && !showLabels,
            position: "center",
            formatter: () =>
              `{a|${computedCenterText}}\n{b|${computedCenterSubText}}`,
            rich: {
              a: {
                fontSize:
                  typeof centerTextFontSize === "number"
                    ? centerTextFontSize
                    : parseInt(centerTextFontSize as string),
                fontWeight: centerTextFontWeight as any,
                color: centerTextColor,
                lineHeight:
                  typeof centerTextFontSize === "number"
                    ? centerTextFontSize + 10
                    : parseInt(centerTextFontSize as string) + 10,
              },
              b: {
                fontSize:
                  typeof centerSubTextFontSize === "number"
                    ? centerSubTextFontSize
                    : parseInt(centerSubTextFontSize as string),
                fontWeight: centerSubTextFontWeight as any,
                color: centerSubTextColor,
                lineHeight:
                  typeof centerSubTextFontSize === "number"
                    ? centerSubTextFontSize + 10
                    : parseInt(centerSubTextFontSize as string) + 10,
              },
            },
          },
          emphasis: {
            label: showCenter
              ? {
                  show: true,
                  position: "center",
                  fontSize:
                    typeof centerTextFontSize === "number"
                      ? centerTextFontSize
                      : parseInt(centerTextFontSize as string),
                  fontWeight: centerTextFontWeight as any,
                  color: centerTextColor,
                  formatter: (params: any) => {
                    const mainValue = showPercent
                      ? `${params.percent.toFixed(0)}%`
                      : params.value;
                    const subText = params.name;
                    return `{a|${mainValue}}\n{b|${subText}}`;
                  },
                  rich: {
                    a: {
                      fontSize:
                        typeof centerTextFontSize === "number"
                          ? centerTextFontSize
                          : parseInt(centerTextFontSize as string),
                      fontWeight: centerTextFontWeight as any,
                      color: centerTextColor,
                      lineHeight:
                        typeof centerTextFontSize === "number"
                          ? centerTextFontSize + 10
                          : parseInt(centerTextFontSize as string) + 10,
                    },
                    b: {
                      fontSize:
                        typeof centerSubTextFontSize === "number"
                          ? centerSubTextFontSize
                          : parseInt(centerSubTextFontSize as string),
                      fontWeight: centerSubTextFontWeight as any,
                      color: centerSubTextColor,
                      lineHeight:
                        typeof centerSubTextFontSize === "number"
                          ? centerSubTextFontSize + 10
                          : parseInt(centerSubTextFontSize as string) + 10,
                    },
                  },
                }
              : undefined,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          labelLine: {
            show: showLabels,
          },
        },
      ],
    }),
    [
      colors,
      showTooltip,
      tooltipFormatter,
      showLegend,
      legendOrient,
      legendPosition,
      legendTop,
      legendLeft,
      legendRight,
      legendBottom,
      legendItemWidth,
      legendItemHeight,
      legendItemGap,
      chartRadius,
      data,
      showLabels,
      labelPosition,
      labelFormatter,
      showPercent,
      showCenter,
      centerTextFontSize,
      centerTextFontWeight,
      centerTextColor,
      computedCenterText,
      computedCenterSubText,
      centerSubTextFontSize,
      centerSubTextFontWeight,
      centerSubTextColor,
      type,
    ],
  );

  const getSvgElement = (): SVGSVGElement | null => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      if (instance) {
        const svgStr = instance.renderToSVGString();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgStr, "image/svg+xml");
        return doc.documentElement as unknown as SVGSVGElement;
      }
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: "5px",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
          }}
        >
          <Skeleton
            variant="circular"
            width={sizeCircularSkeleton}
            height={sizeCircularSkeleton}
          />
          {showLegend && (
            <Box
              sx={{
                minWidth: 160,
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.25,
              }}
            >
              {data.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={legendItemWidth}
                    height={legendItemHeight}
                  />
                  <Skeleton variant="text" width={80} height={18} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      );
    }

    if (!data || data.length === 0 || totalValue === 0) {
      return (
        <Box
          sx={{
            width: "100%",
            flex: 1,
            minHeight: typeof height === "number" ? height : 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {messageDefault}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: typeof width === "number" ? `${width}px` : width,
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
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
        height: heightCard,
        "@media print": {
          height: "auto",
        },
      }}
    >
      <CardContent
        sx={{
          p: cardPadding,
          "&:last-child": {
            pb: cardPadding,
          },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: title || subTitle ? 1 : 0 }}
        >
          <Box>
            {title && (
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  color: "#111827",
                  fontSize: "1.125rem",
                }}
              >
                {title}
              </Typography>
            )}
            {subTitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "#6B7280",
                  mt: 0.5,
                }}
              >
                {subTitle}
              </Typography>
            )}
          </Box>
          {exportEnabled && (
            <ExportChartOrIndicator
              filename={exportFilename}
              modes={exportModes}
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
        <Box sx={{ flex: 1, minHeight: 0 }}>{renderContent()}</Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(PieChartECharts, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isError === nextProps.isError &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.colors === nextProps.colors &&
    prevProps.type === nextProps.type
  );
});
