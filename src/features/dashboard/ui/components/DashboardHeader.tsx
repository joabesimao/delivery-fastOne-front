import {
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import WifiTetheringRoundedIcon from "@mui/icons-material/WifiTetheringRounded";
import {
  PERIOD_OPTIONS,
  type DashboardPeriod,
  type DateInputRange,
} from "../../domain/dashboardPeriod";

interface DashboardHeaderProps {
  greeting: string;
  todayLabel: string;
  connected: boolean;
  period: DashboardPeriod;
  customRange: DateInputRange;
  onPeriodChange: (period: DashboardPeriod) => void;
  onCustomRangeChange: (changes: Partial<DateInputRange>) => void;
  onNewOrder: () => void;
}

const DashboardHeader = ({
  greeting,
  todayLabel,
  connected,
  period,
  customRange,
  onPeriodChange,
  onCustomRangeChange,
  onNewOrder,
}: DashboardHeaderProps) => (
  <Stack
    direction={{ xs: "column", lg: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", lg: "center" }}
    gap={1.5}
  >
    <Box>
      <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Olá, {greeting}
        </Typography>
        <Chip
          label={connected ? "Sincronização ativa" : "Reconectando..."}
          color={connected ? "success" : "warning"}
          size="small"
          sx={{ fontWeight: 700, "& .MuiChip-label": { px: 1.2 } }}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
        sx={{ mt: 0.5 }}
      >
        <Stack direction="row" spacing={0.6} alignItems="center">
          <CalendarTodayRoundedIcon
            sx={{ fontSize: 15, color: "text.secondary" }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textTransform: "capitalize" }}
          >
            {todayLabel}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.6} alignItems="center">
          <WifiTetheringRoundedIcon
            sx={{
              fontSize: 15,
              color: connected ? "success.main" : "text.disabled",
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {connected
              ? "Conectado em tempo real"
              : "Sem conexão em tempo real"}
          </Typography>
        </Stack>
      </Stack>
    </Box>

    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      alignItems={{ xs: "stretch", sm: "center" }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={period}
        onChange={(_, value: DashboardPeriod | null) =>
          value && onPeriodChange(value)
        }
        sx={{
          bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
          borderRadius: 999,
          p: 0.4,
          "& .MuiToggleButtonGroup-grouped": {
            border: 0,
            borderRadius: "999px !important",
            px: 1.5,
            fontWeight: 700,
            fontSize: 12.5,
            textTransform: "none",
          },
        }}
      >
        {PERIOD_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {period === "custom" && (
        <Stack direction="row" spacing={1}>
          <TextField
            type="date"
            size="small"
            value={customRange.start}
            onChange={(e) => onCustomRangeChange({ start: e.target.value })}
          />
          <TextField
            type="date"
            size="small"
            value={customRange.end}
            onChange={(e) => onCustomRangeChange({ end: e.target.value })}
          />
        </Stack>
      )}

      <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={onNewOrder}
        sx={{ borderRadius: 999, px: 2.5, whiteSpace: "nowrap" }}
      >
        Novo Pedido
      </Button>
    </Stack>
  </Stack>
);

export default DashboardHeader;
