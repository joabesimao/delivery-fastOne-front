import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useTheme, useMediaQuery } from "@mui/material";

interface ChartData {
  name: string;
  value: number;
}

interface ChartPieOrDonutProps {
  title?: string;
  data: ChartData[];
  height?: number | string;
  sizeCircularSkeleton?: number | string;
  width?: number | string;
  menssageDefault?: string;
  colors?: string[];
  type?: "pie" | "donut";
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  legendPositionHorizontal?: "left" | "center" | "right";
  showDataLabels?: boolean;
  showToolbar?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  centerText?: string;
  centerSubText?: string;
  heightCard?: string | number;
  showPercent?: boolean;
  showCenter?: boolean;
  subTitle?: string;
  heightLegend?: number;
  fontWeightCenterText?: string;
  fontWeightCenterSubText?: string;
  donutHoleSize?: string | number;
  outsideLabels?: boolean;
  outsideLabelsOffset?: number;
  chartOffsetX?: number;
  chartOffsetY?: number;
  outsideLabelsReserve?: number;
  pieCustomScale?: number;
  outsideLabelFontSize?: number | string;
  outsideLabelFontWeight?: number | string;
  showLeaderLines?: boolean;
  leaderLineWidth?: number;
  leaderLineCapLength?: number;
  leaderLineOpacity?: number;
  heightLine?: number;
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
  exportPdfTitle?: string;
  exportPdfSubTitle?: string;
  valueIsPercentage?: boolean;
  legendOffsetY?: number;
  customLegend?: () => React.ReactNode;
  itemShowCenter?: string;
  exportIncludeLegend?: boolean;
  cardPadding?: number | string;
}

const ChartPieOrDonut: React.FC<ChartPieOrDonutProps> = ({
  title = "",
  data,
  height,
  width,
  menssageDefault = "Nenhum dado encontrado",
  heightCard,
  colors = ["#17D6A3", "#FF6B6B", "#FFC107", "#07A7DF", "#6C5CE7", "#A0A0A0"],
  type = "donut",
  showLegend = true,
  legendPosition = "right",
  legendPositionHorizontal = "center",
  showDataLabels = false,
  showToolbar = true,
  isLoading = false,
  isError = false,
  errorMessage = "Erro ao carregar o gráfico. Tente novamente.",
  centerText,
  centerSubText,
  showPercent = true,
  showCenter = true,
  subTitle,
  heightLegend,
  fontWeightCenterText,
  fontWeightCenterSubText,
  donutHoleSize,
  outsideLabels = false,
  outsideLabelsOffset = 40,
  chartOffsetX,
  chartOffsetY,
  outsideLabelsReserve = 0,
  pieCustomScale,
  outsideLabelFontSize,
  outsideLabelFontWeight,
  showLeaderLines = false,
  leaderLineWidth = 0,
  leaderLineCapLength = 0,
  leaderLineOpacity = 0,
  heightLine = 0,
  exportEnabled = false,
  exportFilename,
  exportModes = ["pdf"],
  exportCsvHeaders,
  exportCsvRows,
  exportCsvRecords,
  exportPdfDpi,
  exportPdfMarginMm,
  exportPdfMaxWidthMm,
  exportRasterScale,
  exportPdfOrientation,
  exportPdfTitle,
  exportPdfSubTitle,
  valueIsPercentage = false,
  legendOffsetY,
  sizeCircularSkeleton = "125px",
  customLegend,
  itemShowCenter,
  exportIncludeLegend = true,
  cardPadding = 2,
}) => {
  const donutHoleSizeStr =
    typeof donutHoleSize === "number" ? `${donutHoleSize}px` : donutHoleSize;

  const computedChartHeight =
    typeof height === "number"
      ? height + (outsideLabels ? outsideLabelsReserve : 0)
      : height;

  const normalizedData = useMemo(
    () =>
      Array.isArray(data)
        ? data.map((item) => ({
            name: item?.name ?? "",
            value: Number(item?.value ?? 0),
          }))
        : [],
    [data],
  );

  const totalValue = normalizedData.reduce((sum, item) => sum + item.value, 0);
  const selectItemShowCenter = itemShowCenter ? itemShowCenter : centerSubText;
  const centerCategoryValue = selectItemShowCenter
    ? (normalizedData.find((d) => d.name === selectItemShowCenter)?.value ?? 0)
    : 0;

  const allZero =
    normalizedData.length > 0 &&
    normalizedData.every((d) => Number(d?.value || 0) === 0);

  let computedCenter = showPercent
    ? totalValue > 0
      ? Math.round((centerCategoryValue / totalValue) * 100).toString()
      : "0"
    : totalValue.toString();
  if (typeof centerText === "string" && centerText.length > 0) {
    computedCenter = centerText;
  }

  const displayCenterText =
    showPercent && !computedCenter.includes("%")
      ? `${computedCenter}%`
      : computedCenter;
  const displayCenterSubText = showPercent ? centerSubText || "" : "Total";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const chartIdRef = useRef<string>(
    `pie_${Math.random().toString(36).slice(2, 9)}`,
  );

  // Key that forces ReactApexChart to fully remount when series shape changes.
  // Prevents the ApexCharts internal promise race that causes:
  // "t3.hasOwnProperty is not a function" / "dom.Paper is undefined"
  const apexChartKey = useMemo(() => {
    const dataKey = normalizedData.map((d) => `${d.name}:${d.value}`).join("|");
    return `${chartIdRef.current}||${type}||${dataKey}`;
  }, [normalizedData, type]);

  const [chartVisible, setChartVisible] = useState(false);
  useEffect(() => {
    setChartVisible(false);
    const timer = setTimeout(() => setChartVisible(true), 80);
    return () => {
      clearTimeout(timer);
      setChartVisible(false);
    };
  }, [apexChartKey]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () =>
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoading]);

  const midAngles = useMemo(() => {
    const total = totalValue || 1;
    let acc = -Math.PI / 2;
    return normalizedData.map((d) => {
      const arc = (d.value / total) * Math.PI * 2;
      const mid = acc + arc / 2;
      acc += arc;
      return mid;
    });
  }, [normalizedData, totalValue]);

  const useLeader =
    (showLeaderLines ?? outsideLabels) && outsideLabels && totalValue > 0;

  const renderContent = () => {
    if (isError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      );
    }

    if (isLoading) {
      const markerSize = typeof heightLegend === "number" ? heightLegend : 12;
      const legendCount = normalizedData.length ? normalizedData.length : 3;
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: "5px",
            flexDirection: isMobile ? "column" : "row",
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
              {[...Array(legendCount)].map((_, i) => (
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
                    width={markerSize}
                    height={markerSize}
                  />
                  <Skeleton variant="text" width={50} height={18} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      );
    }

    if (normalizedData.length === 0 || allZero) {
      return (
        <Box
          sx={{
            width: "100%",
            flex: 1,
            minHeight:
              typeof computedChartHeight === "number"
                ? computedChartHeight
                : 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {menssageDefault || "Nenhum dado disponível para exibir."}
          </Typography>
        </Box>
      );
    }

    if (!chartVisible) {
      return (
        <Box
          sx={{
            width: "100%",
            height:
              typeof computedChartHeight === "number"
                ? `${computedChartHeight}px`
                : computedChartHeight,
            minHeight: 150,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 2 }}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: "0px", md: customLegend ? "10px" : "0" },
          alignItems: "center",
          overflow: "visible",
          position: "relative",
          "& .apexcharts-toolbar": {
            right: 0,
            top: 0,
          },
          "& .apexcharts-datalabel-value": {
            stroke: "#FFFFFF",
            strokeWidth: 6,
            paintOrder: "stroke",
            strokeLinejoin: "round",
            strokeLinecap: "round",
            filter: "drop-shadow(0 0 2px rgba(255,255,255,0.85))",
            textShadow: "0 0 2px #FFFFFF, 0 0 4px rgba(255,255,255,0.9)",
          },
          "& .apexcharts-datalabel-label": {
            stroke: "#FFFFFF",
            strokeWidth: 4,
            paintOrder: "stroke",
            filter: "drop-shadow(0 0 2px rgba(255,255,255,0.85))",
            textShadow: "0 0 2px #FFFFFF",
          },
        }}
        ref={containerRef}
      >
        <ReactApexChart
          key={apexChartKey}
          options={options}
          series={normalizedData.map((item) => item.value)}
          type={type}
          height={computedChartHeight}
          width={width}
        />
        {customLegend && customLegend()}
        {useLeader &&
          typeof computedChartHeight === "number" &&
          containerSize.w > 0 && (
            <svg
              className="pie-leader-lines"
              width={containerSize.w}
              height={computedChartHeight}
              viewBox={`0 0 ${containerSize.w} ${computedChartHeight}`}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "visible",
              }}
            >
              {normalizedData.map((d, i) => {
                if (!d.value) return null;
                const angle = midAngles[i];
                const cx =
                  containerSize.w / 2 +
                  (typeof chartOffsetX === "number" ? chartOffsetX : 0);
                const cy =
                  (computedChartHeight as number) / 2 +
                  (typeof chartOffsetY === "number" ? chartOffsetY : 0);
                const baseRadius =
                  Math.min(containerSize.w, computedChartHeight as number) / 2;
                const scale =
                  typeof pieCustomScale === "number" ? pieCustomScale : 1;
                const radius = baseRadius * scale * heightLine;
                const ox = Math.cos(angle);
                const oy = Math.sin(angle);
                const x1 = cx + ox * radius;
                const y1 = cy + oy * radius;
                const outward = (outsideLabelsOffset ?? 40) - 8;
                const x2 = cx + ox * (radius + outward);
                const y2 = cy + oy * (radius + outward);
                const cap = leaderLineCapLength;
                const x3 = x2 + (ox >= 0 ? cap : -cap);
                const y3 = y2;
                const stroke =
                  colors && colors.length ? colors[i % colors.length] : "#999";
                const sw = leaderLineWidth;
                const op = leaderLineOpacity;
                return (
                  <g key={`leader-${i}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={stroke}
                      strokeWidth={sw}
                      opacity={op}
                    />
                    <line
                      x1={x2}
                      y1={y2}
                      x2={x3}
                      y2={y3}
                      stroke={stroke}
                      strokeWidth={sw}
                      opacity={op}
                    />
                  </g>
                );
              })}
            </svg>
          )}
      </Box>
    );
  };

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: type,
        height: computedChartHeight,
        id: chartIdRef.current,
        ...(typeof chartOffsetX === "number" ? { offsetX: chartOffsetX } : {}),
        ...(typeof chartOffsetY === "number" ? { offsetY: chartOffsetY } : {}),
        toolbar: {
          show: showToolbar,
          offsetX: 0,
          offsetY: 0,
        },
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
      labels: normalizedData.map((item) => item.name),
      colors: colors,
      dataLabels: {
        enabled: showDataLabels || outsideLabels,
        formatter: function (val: number, opts) {
          if (!outsideLabels) return `${val}`;
          const label = opts.w?.globals?.labels?.[opts.seriesIndex] ?? "";
          const percent = Math.round(val);
          return `${label} (${percent}%)`;
        },
        style: {
          fontSize: outsideLabels
            ? (typeof outsideLabelFontSize === "number"
                ? `${outsideLabelFontSize}px`
                : outsideLabelFontSize) || "12px"
            : "12px",
          fontWeight: (outsideLabels
            ? ((outsideLabelFontWeight as any) ?? 600)
            : 600) as any,
          colors: outsideLabels ? colors : ["#fff"],
        },
        textAnchor: outsideLabels ? "start" : "middle",
        offsetX: outsideLabels ? 10 : 0,
        dropShadow: {
          enabled: false,
        },
      },
      legend: {
        show: showLegend,
        position: legendPosition,
        horizontalAlign: legendPositionHorizontal,
        labels: { colors: "#71717A" },
        markers: {
          size: heightLegend ? heightLegend : 12,
          shape: "square" as const,
        },
        offsetY: legendOffsetY,
      },
      plotOptions: {
        pie: {
          ...(typeof pieCustomScale === "number"
            ? { customScale: pieCustomScale }
            : {}),
          dataLabels: {
            offset: outsideLabels ? outsideLabelsOffset : 0,
            minAngleToShowLabel: outsideLabels ? 5 : undefined,
          },
          donut: {
            size: type === "donut" ? (donutHoleSizeStr ?? "70%") : "0%",
            labels: {
              show: showCenter,
              name: {
                show: showCenter,
                fontSize: "14px",
                fontWeight: 600,
                color: "#6B7280",
                offsetY: 20,
              },
              value: {
                show: showCenter,
                fontSize: fontWeightCenterText ? fontWeightCenterText : "32px",
                fontWeight: "bold",
                color: "#111827",
                offsetY: -15,
                formatter: function (val: string) {
                  if (!val) return "";
                  if (showPercent && !valueIsPercentage) {
                    const raw = parseFloat(val.replace(/[^0-9.+-]/g, ""));
                    const pct =
                      totalValue > 0 ? Math.round((raw / totalValue) * 100) : 0;
                    return `${pct}%`;
                  }
                  if (showPercent && valueIsPercentage) {
                    return /%$/.test(val) ? val : `${val}%`;
                  }

                  return val.replace(/%$/, "");
                },
              },
              total: {
                show: showCenter,
                label: displayCenterSubText,
                color: "#6B7280",
                fontSize: fontWeightCenterSubText
                  ? fontWeightCenterSubText
                  : "14px",
                fontWeight: 600,
                formatter: function () {
                  return displayCenterText;
                },
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      tooltip: {
        theme: "light",
        style: {
          fontSize: "12px",
        },
        y: {
          formatter: (value: number, _) => {
            if (!valueIsPercentage) {
              return `${value}`;
            }
            return showPercent ? `${value}%` : `${value}`;
          },
        },
      },
    }),
    [
      type,
      computedChartHeight,
      chartOffsetX,
      chartOffsetY,
      showToolbar,
      normalizedData,
      colors,
      showDataLabels,
      outsideLabels,
      outsideLabelFontSize,
      outsideLabelFontWeight,
      outsideLabelsOffset,
      showLegend,
      legendPosition,
      legendPositionHorizontal,
      heightLegend,
      legendOffsetY,
      pieCustomScale,
      donutHoleSizeStr,
      showCenter,
      fontWeightCenterText,
      showPercent,
      valueIsPercentage,
      totalValue,
      centerCategoryValue,
    ],
  );

  const toSvgDataUri = (svgString: string) =>
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgString)));

  const buildExportSvgWithLegendBottom = (): {
    svgString: string;
    svgElement?: SVGSVGElement;
  } | null => {
    if (!containerRef.current) return null;
    const chartSvg = containerRef.current.querySelector(
      "svg.apexcharts-svg",
    ) as SVGSVGElement | null;
    if (!chartSvg) return null;

    const chartW =
      Number(chartSvg.getAttribute("width")) || containerSize.w || 0;
    const chartH =
      Number(chartSvg.getAttribute("height")) ||
      (typeof computedChartHeight === "number" ? computedChartHeight : 0);

    if (!chartW || !chartH) return null;

    const apexSvgString = new XMLSerializer().serializeToString(chartSvg);
    const apexDataUri = toSvgDataUri(apexSvgString);

    const pad = 10;
    const marker = 10;
    const gap = 6;
    const textPad = 6;
    const rowHeight = marker + gap;
    const itemsCount = normalizedData.length;

    const legendBlockH = pad + itemsCount * rowHeight + pad;
    const outerW = chartW;
    const outerH = chartH + legendBlockH;
    const legendX = pad;
    const legendY = chartH + pad;

    const fs = "12px";
    const textColor = "#71717A";

    const itemsSvg = normalizedData
      .map((d, i) => {
        const color =
          colors && colors.length ? colors[i % colors.length] : "#999";
        const yRect = legendY + i * rowHeight;
        const xRect = legendX;
        const xText = xRect + marker + textPad;
        const yText = yRect + marker - 1;
        return `
          <g>
            <rect x="${xRect}" y="${yRect}" width="${marker}" height="${marker}" fill="${color}" rx="2" ry="2"/>
            <text x="${xText}" y="${yText}" font-size="${fs}" fill="${textColor}">${d.name}</text>
          </g>
        `;
      })
      .join("");

    const outerSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${outerW}" height="${outerH}" viewBox="0 0 ${outerW} ${outerH}">
        <image x="0" y="0" width="${chartW}" height="${chartH}" href="${apexDataUri}" />
        ${itemsSvg}
      </svg>
    `;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(outerSvg, "image/svg+xml");
      const svgEl = doc.documentElement as unknown as SVGSVGElement;
      return { svgString: outerSvg, svgElement: svgEl };
    } catch {
      return { svgString: outerSvg };
    }
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
        "@media print": {
          height: "auto",
        },
      }}
    >
      <CardContent
        sx={{
          flexDirection: "column",
          display: "flex",
          height: !isError && !isLoading ? "100%" : "auto",
          py: cardPadding,
        }}
      >
        <Stack>
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
            {exportEnabled &&
              !isLoading &&
              !isError &&
              normalizedData.length > 0 && (
                <ExportChartOrIndicator
                  modes={exportModes}
                  filename={
                    exportFilename ||
                    (title ? title.replace(/\s+/g, "-") : "chart")
                  }
                  title={exportPdfTitle ?? title ?? ""}
                  subTitle={exportPdfSubTitle ?? subTitle ?? ""}
                  tooltip="Exportar"
                  getImageData={async () => {
                    if (exportIncludeLegend) {
                      const combined = buildExportSvgWithLegendBottom();
                      if (combined?.svgString) {
                        return toSvgDataUri(combined.svgString);
                      }
                    }
                    const res = await ApexCharts.exec(
                      chartIdRef.current,
                      "dataURI",
                    );
                    return (res as any)?.imgURI as string;
                  }}
                  getSvgElement={() => {
                    if (exportIncludeLegend) {
                      const combined = buildExportSvgWithLegendBottom();
                      if (combined?.svgElement) return combined.svgElement;
                    }
                    const el = containerRef.current;
                    if (!el) return null;
                    const svg = el.querySelector("svg");
                    return svg instanceof SVGSVGElement ? svg : null;
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
              component="div"
              sx={{
                color: "#71717A",
                mb: "5px",
                lineHeight: 1,
              }}
            >
              {subTitle}
            </Typography>
          )}
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(ChartPieOrDonut, (prevProps, nextProps) => {
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
