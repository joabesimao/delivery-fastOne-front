import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";

interface ProgressCardProps {
  label: string;
  value: number;
  color?: string;
  animationDuration?: number;
  isPercentage?: boolean;
  maxValue?: number;
  isLoading?: boolean;
  isError?: boolean;
  colorDinamic?: boolean;
  heightLinearProgress?: number | string;
  noCard?: boolean;
  gap?: number | string;
  sxLabel?: object;
  sxValue?: object;
  showValueFraction?: boolean;
  extraTextValueFraction?: string;
}

const ProgressCard = ({
  label,
  value = 0,
  color = "#0F2757",
  animationDuration = 1500,
  isPercentage = false,
  maxValue = 10,
  isLoading = false,
  isError = false,
  colorDinamic = false,
  heightLinearProgress = "21px",
  noCard = false,
  gap = 2,
  sxLabel,
  sxValue,
  showValueFraction,
  extraTextValueFraction,
}: ProgressCardProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  const getPercentage = (currentValue: number) => {
    if (isPercentage) {
      return Math.min(currentValue, 100);
    } else {
      return Math.min((currentValue / maxValue) * 100, 100);
    }
  };

  const getDynamicColor = (currentValue: number) => {
    if (!colorDinamic) return color;

    const percentage = getPercentage(currentValue);
    return percentage >= 50 ? "#17D6A3" : "#FF4043";
  };

  const getDisplayValue = (currentValue: number) => {
    const formatNumber = (num: number) => {
      const rounded = Math.round(num * 100) / 100;
      if (rounded % 1 === 0) {
        return rounded.toString();
      }
      return rounded.toFixed(2).replace(/\.?0+$/, "");
    };

    if (isPercentage) {
      return `${formatNumber(currentValue)}%`;
    } else if (showValueFraction) {
      return `${formatNumber(currentValue)} / ${formatNumber(maxValue)} ${
        extraTextValueFraction ? extraTextValueFraction : ""
      }`;
    } else {
      return formatNumber(currentValue);
    }
  };

  useEffect(() => {
    if (!isLoading && !isError) {
      const startAnimation = () => {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
          const easedProgress = easeOutCubic(progress);
          setAnimatedValue(value * easedProgress);
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      };
      startAnimation();
    }
  }, [value, animationDuration, isLoading, isError]);

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 2,
        backgroundColor: noCard ? "transparent" : "inherit",
        border: noCard ? "none" : "1px solid #E4E4E7",
        boxShadow: noCard ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
        transition: noCard
          ? "none"
          : "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: noCard ? "none" : "translateY(-2px)",
          boxShadow: noCard ? "none" : "0 4px 16px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: noCard ? 0 : 3 }}>
        {isError ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: gap }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "1rem",
                  ...sxLabel,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "text.secondary",
                }}
              >
                --
              </Typography>
            </Box>
            <Box sx={{ width: "100%" }}>
              <LinearProgress
                variant="determinate"
                value={0}
                sx={{
                  height: "21px",
                  borderRadius: 4,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    backgroundColor: "grey.400",
                    transition: "transform 0.1s ease-in-out",
                  },
                }}
              />
            </Box>
          </Box>
        ) : isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: gap }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="30%" height={32} />
            </Box>
            <Skeleton variant="rounded" width="100%" height={21} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: gap }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: "1rem",
                  ...sxLabel,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  ...sxValue,
                }}
              >
                {getDisplayValue(animatedValue)}
              </Typography>
            </Box>

            <Box sx={{ width: "100%" }}>
              <LinearProgress
                variant="determinate"
                value={getPercentage(animatedValue)}
                sx={{
                  height: heightLinearProgress,
                  borderRadius: 4,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    backgroundColor: getDynamicColor(animatedValue),
                    transition: "transform 0.1s ease-in-out",
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
export default ProgressCard;
