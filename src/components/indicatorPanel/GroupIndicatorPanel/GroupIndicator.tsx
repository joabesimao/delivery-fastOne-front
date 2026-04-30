import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
} from "@mui/material";

interface IndicatorItem {
  leftLabel: string;
  rightLabel?: string;
  value: number;
  total?: number;
  showPercentage?: boolean;
}

interface GroupIndicatorPanelProps {
  title: string;
  items: IndicatorItem[];
  isLoading?: boolean;
  isError?: boolean;
}

const GroupIndicatorPanel = ({
  title,
  items,
  isLoading = false,
  isError = false,
}: GroupIndicatorPanelProps) => {
  const formatDisplayValue = (item: IndicatorItem) => {
    let displayValue = item.value.toString();

    if (item.total && item.showPercentage && item.total > 0) {
      const percentage = Math.round((item.value / item.total) * 100);
      displayValue = `${item.value} (${percentage}%)`;
    }

    return displayValue;
  };

  const renderContent = () => {
    if (isError) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          Erro ao carregar informações adicionais
        </Alert>
      );
    }

    if (isLoading) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Skeleton variant="text" width={180} height={20} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  fontSize: "0.875rem",
                }}
              >
                {item.leftLabel}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: "1.1rem",
                }}
              >
                {formatDisplayValue(item)}
              </Typography>
            </Box>
          ))
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
              Nenhuma informação disponível
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
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: "1.1rem",
            mb: 3,
          }}
        >
          {title}
        </Typography>

        {renderContent()}
      </CardContent>
    </Card>
  );
};
export default GroupIndicatorPanel;
