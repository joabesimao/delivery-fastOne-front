import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import { ReactNode } from "react";

interface IndicatorPerformanceProps {
  title?: string;
  subTitle?: string;
  img?: ReactNode;
  titleCustom?: ReactNode;
  footerTitle?: string;
  valueCustom?: ReactNode;
  value?: number | string;
  color?: string;
  isLoading?: boolean;
  isError?: boolean;
  height?: string | number;
  hiddenTarget?: boolean;
  gapVertical?: number | string;
  fontSizeTitle?: number | string;
  paddingCardContent?: number | string;
  sxTitle?: object;
  chipText?: string;
  sxChip?: object;
  chipTooltip?: string;
}

const IndicatorPerformance = ({
  title,
  subTitle,
  footerTitle,
  titleCustom,
  img,
  value,
  valueCustom,
  color = "#0EA5E9",
  isLoading = false,
  isError = false,
  height = "auto",
  hiddenTarget = false,
  gapVertical = 1.5,
  paddingCardContent = 3,
  fontSizeTitle = "1.05rem",
  sxTitle,
  chipText,
  sxChip,
  chipTooltip,
}: IndicatorPerformanceProps) => {
  const formatValue = (v: number | string) => {
    if (typeof v === "number") {
      try {
        return new Intl.NumberFormat("pt-BR").format(v);
      } catch {
        return v.toString();
      }
    }
    return v;
  };

  const LoadingState = (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          bgcolor: "#E5E7EB",
          borderRadius: "8px 0 0 8px",
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, pr: 2 }}>
          <Skeleton variant="text" width={220} height={24} />
          <Skeleton variant="text" width={260} height={18} />
        </Box>
        <Skeleton variant="circular" width={36} height={36} />
      </Box>
      <Skeleton variant="text" width={140} height={48} sx={{ mt: 2 }} />
    </Box>
  );

  return (
    <Card
      sx={{
        height,
        borderRadius: 2,
        border: "1px solid #E4E4E7",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        },
      }}
    >
      {!hiddenTarget && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            bgcolor: color,
          }}
        />
      )}

      <CardContent sx={{ p: paddingCardContent, overflow: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: gapVertical,
            overflowY: "auto",
            maxWidth: "100%",
            maxHeight:
              typeof height === "number" ||
              (typeof height === "string" && height.endsWith("px"))
                ? `calc(${
                    typeof height === "number" ? height + "px" : height
                  } - 32px)`
                : "100%",
            paddingBottom: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "5px",
            }}
          >
            <Box sx={{ flex: 1, pr: 2 }}>
              {title && (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: fontSizeTitle,
                    lineHeight: 1.2,
                    ...sxTitle,
                  }}
                >
                  {title}
                </Typography>
              )}
              {titleCustom && titleCustom}
              {subTitle && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  {subTitle}
                </Typography>
              )}
            </Box>
            {img && (
              <Box
                sx={{
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {img}
              </Box>
            )}
          </Box>
          {isError ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              Erro ao carregar os indicadores. Tente novamente.
            </Alert>
          ) : isLoading && !isError ? (
            LoadingState
          ) : (
            <>
              {value && (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color,
                    fontSize: { xs: "1.75rem", sm: "2.5rem" },
                  }}
                >
                  {formatValue(value)}
                </Typography>
              )}
              {valueCustom && valueCustom}
            </>
          )}
          {chipText && (
            <Tooltip title={chipTooltip || ""} placement="top">
              <Chip
                label={chipText}
                sx={{
                  alignSelf: "flex-start",
                  width: "fit-content",
                  color,
                  bgcolor: `${color}1A`,
                  fontSize: "0.7rem",
                  ...sxChip,
                }}
              />
            </Tooltip>
          )}
          {footerTitle && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {footerTitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default IndicatorPerformance;
