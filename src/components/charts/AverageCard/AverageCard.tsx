import React, { useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Alert,
  Rating,
} from "@mui/material";
import ExportChartOrIndicator, {
  ExportMode,
} from "@/components/exports/ExportChartOrIndicator";
import html2canvas from "html2canvas";

export interface AverageCardProps {
  title?: string;
  subTitle?: string;
  average: number;
  minimumAverage: number;
  totalEvaluated?: number;
  maxScore?: number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  heightCard?: number | string;
  stars?: number;
  starSize?: number | string;
  starColor?: string;
  emptyStarColor?: string;
  exportEnabled?: boolean;
  exportFilename?: string;
  exportModes?: ExportMode[];
  exportPdfDpi?: number;
  exportPdfMarginMm?: number;
  exportPdfMaxWidthMm?: number;
  exportDomScale?: number;
}

const formatPtNumber = (value: number, digits = 1) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const AverageAcademicCard: React.FC<AverageAcademicCardProps> = ({
  title = "Desempenho acadêmico médio",
  subTitle,
  average,
  minimumAverage,
  maxScore = 10,
  isLoading,
  isError,
  errorMessage = "Erro ao carregar o card.",
  heightCard,
  stars,
  starSize,
  starColor,
  emptyStarColor,
  exportEnabled = false,
  exportFilename,
  exportModes = ["pdf"],
  exportPdfDpi = 150,
  exportPdfMarginMm = 10,
  exportPdfMaxWidthMm,
  exportDomScale = 2,
}) => {
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
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid #E4E4E7",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          width: "100%",
          height: heightCard,
        }}
      >
        <CardContent sx={{ p: "20px" }}>
          {title && (
            <Typography
              variant="h6"
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
              variant="body2"
              sx={{ color: "#71717A", mb: "5px", lineHeight: 1 }}
            >
              {subTitle}
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Skeleton variant="text" width={80} height={56} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Skeleton variant="rectangular" width={160} height={24} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Skeleton variant="text" width={120} height={18} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid #E4E4E7",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          width: "100%",
          height: heightCard,
        }}
      >
        <CardContent
          sx={{
            justifyContent: "space-around",
            flexDirection: "column",
            display: "flex",
            height: !isError && !isLoading ? "100%" : "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box display="flex" justifyContent={"space-between"} width="100%">
              {title && (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "1.1rem",
                    mb: subTitle ? 0 : 2,
                    lineHeight: 1.25,
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
                      (title ? title.replace(/\s+/g, "-") : "average-academic")
                    }
                    title={title}
                    subTitle={subTitle}
                    tooltip="Exportar"
                    getImageData={getImageData}
                    pdfDpi={exportPdfDpi}
                    pdfMarginMm={exportPdfMarginMm}
                    pdfMaxWidthMm={exportPdfMaxWidthMm}
                  />
                </Box>
              )}
            </Box>
            {subTitle && (
              <Typography
                variant="body2"
                sx={{ color: "#71717A", mb: "5px", lineHeight: 1 }}
              >
                {subTitle}
              </Typography>
            )}
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const safeMax = maxScore > 0 ? maxScore : 10;
  const clampedAvg = Math.max(
    0,
    Math.min(safeMax, Number.isFinite(average) ? average : 0),
  );
  const starsTotal = typeof stars === "number" && stars > 0 ? stars : 5;
  const ratingValue = (clampedAvg / safeMax) * starsTotal;

  let legendText: string =
    clampedAvg > minimumAverage
      ? "Média alta"
      : clampedAvg === minimumAverage
        ? "Média mediana"
        : "Abaixo da média";

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
          p: "20px",
          justifyContent: "space-around",
          flexDirection: "column",
          display: "flex",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            {title && (
              <Typography
                variant="h6"
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
                variant="body2"
                sx={{ color: "#71717A", mb: "5px", lineHeight: 1 }}
              >
                {subTitle}
              </Typography>
            )}
          </Box>
          {exportEnabled && (
            <Box data-html2canvas-ignore="true">
              <ExportChartOrIndicator
                modes={exportModes}
                filename={
                  exportFilename ||
                  (title ? title.replace(/\s+/g, "-") : "average-academic")
                }
                title={title}
                subTitle={subTitle}
                tooltip="Exportar"
                getImageData={getImageData}
                pdfDpi={exportPdfDpi}
                pdfMarginMm={exportPdfMarginMm}
                pdfMaxWidthMm={exportPdfMaxWidthMm}
              />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 1,
          }}
          ref={captureRef}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1,
              mb: 1,
            }}
          >
            {formatPtNumber(clampedAvg, 1)}
          </Typography>

          <Rating
            name="average-rating"
            value={ratingValue}
            precision={0.1}
            max={starsTotal}
            readOnly
            sx={{
              color: starColor ?? "#fcb419",
              mb: 1,
              "& .MuiRating-iconEmpty": { color: emptyStarColor ?? "#E5E7EB" },
              ...(starSize
                ? { "& .MuiRating-icon": { fontSize: starSize } }
                : {}),
            }}
          />

          <Typography variant="body2" sx={{ color: "#303030" }}>
            {legendText}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AverageAcademicCard;
