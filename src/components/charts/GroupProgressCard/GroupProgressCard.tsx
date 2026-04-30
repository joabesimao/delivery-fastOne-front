import { useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Tooltip,
} from "@mui/material";
import { lighten } from "@mui/material/styles";
import ExportChartOrIndicator, {
  ExportMode,
} from "@/components/exports/ExportChartOrIndicator";
import html2canvas from "html2canvas";
import { Stack } from "@mui/system";

interface ProgressItem {
  leftLabel: string;
  rightLabel: string;
  value: number;
  color?: string;
  showPercentage?: boolean;
  hideLabelPercentage?: boolean;
  subLeftLabel?: string;
  total?: number;
}

interface GroupProgressCardProps {
  title: string;
  items: ProgressItem[];
  total?: number | null;
  isLoading?: boolean;
  isError?: boolean;
  heightCard?: string | number;
  minHeightCard?: string | number;
  totalPlaceholder?: number;
  exportEnabled?: boolean;
  exportFilename?: string;
  exportModes?: ExportMode[];
  exportPdfDpi?: number;
  exportPdfMarginMm?: number;
  exportPdfMaxWidthMm?: number;
  exportDomScale?: number;
  exportPdfTitle?: string;
  exportPdfSubTitle?: string;
}

const GroupProgressCard = ({
  title,
  items,
  total,
  isLoading = false,
  isError = false,
  heightCard,
  minHeightCard,
  totalPlaceholder,
  exportEnabled = false,
  exportFilename,
  exportModes = ["pdf"],
  exportPdfDpi = 150,
  exportPdfMarginMm = 10,
  exportPdfMaxWidthMm,
  exportDomScale = 2,
  exportPdfTitle,
  exportPdfSubTitle,
}: GroupProgressCardProps) => {
  const captureRef = useRef<HTMLDivElement | null>(null);

  const getImageData = async (): Promise<string> => {
    const node = captureRef.current;
    if (!node) return "";
    const canvas = await html2canvas(node, {
      backgroundColor: "#FFFFFF",
      scale: (window.devicePixelRatio || 1) * (exportDomScale || 1),
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  };
  const getPercentage = (value: number, totalItem: number | null) => {
    const totalProgress = totalItem || total || 0;
    return totalProgress > 0 ? Math.round((value / totalProgress) * 100) : 0;
  };
  const renderContent = () => {
    if (isError) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          Erro ao carregar dados da distribuição
        </Alert>
      );
    }

    if (isLoading) {
      const placeholderCount =
        totalPlaceholder ?? (items.length > 0 ? items.length : 4);
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {[...Array(placeholderCount)].map((_, index) => (
            <Box
              key={`placeholder-${index}-${title}`}
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={80} height={20} />
              </Box>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={8}
                sx={{ borderRadius: 4 }}
              />
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, key: title }}
      >
        {items.length > 0 ? (
          items.map((item, index) => {
            const percentage = getPercentage(item.value, item?.total ?? null);
            const progressTotal = item?.total ?? total ?? null;
            const tooltipTitle =
              `${item.leftLabel}: ${
                item?.showPercentage ? item.value + "%" : item.value
              }` +
              (progressTotal
                ? ` de ${
                    item?.showPercentage
                      ? `${progressTotal}%`
                      : `${progressTotal}`
                  }`
                : "");
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  borderRadius: 1,
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "0.875rem",
                      }}
                    >
                      {item.leftLabel}
                    </Typography>
                    {item?.subLeftLabel && (
                      <Typography variant="body2" color="#71717A">
                        {item?.subLeftLabel}
                      </Typography>
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.rightLabel}
                    {!item?.hideLabelPercentage ? `(${percentage}%)` : null}
                  </Typography>
                </Box>
                <Tooltip title={tooltipTitle} placement="top" arrow>
                  <Box
                    sx={{
                      cursor: "pointer",
                      "&:hover .MuiLinearProgress-bar": {
                        backgroundColor: () =>
                          lighten(item.color || "#3B82F6", 0.2),
                        boxShadow: (theme) => theme.shadows[2],
                      },
                    }}
                  >
                    <LinearProgress
                      aria-label={`${item.leftLabel} ${percentage}%`}
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#E5E7EB",
                        overflow: "hidden",
                        transition:
                          "background-color 0.2s ease, height 0.2s ease",
                        "& .MuiLinearProgress-bar": {
                          transition:
                            "background-color 0.2s ease, box-shadow 0.2s ease",
                          borderRadius: 4,
                          backgroundColor: item.color || "#3B82F6",
                        },
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>
            );
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nenhum dado disponível
            </Typography>
          </Box>
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
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
        height: heightCard,
        minHeight: minHeightCard,
        "@media print": {
          height: "auto",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {(title || exportEnabled) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            {title && (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: "1.1rem",
                  m: 0,
                }}
              >
                {title}
              </Typography>
            )}

            {exportEnabled && (
              <Box data-html2canvas-ignore="true">
                <ExportChartOrIndicator
                  modes={exportModes}
                  filename={
                    exportFilename ||
                    (title ? title.replace(/\s+/g, "-") : "group-progress")
                  }
                  title={(exportPdfTitle ?? title) as string}
                  subTitle={exportPdfSubTitle}
                  tooltip="Exportar"
                  getImageData={getImageData}
                  pdfDpi={exportPdfDpi}
                  pdfMarginMm={exportPdfMarginMm}
                  pdfMaxWidthMm={exportPdfMaxWidthMm}
                />
              </Box>
            )}
          </Box>
        )}

        <Box ref={captureRef}>{renderContent()}</Box>
      </CardContent>
    </Card>
  );
};

export default GroupProgressCard;
