import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  RANKING_PAGE_SIZE_OPTIONS,
  RANKING_STATUS_OPTIONS,
  type RankingFilters,
  type RankingStatusFilter,
} from "../../domain/deliverymanRanking";

interface RankingFiltersCardProps {
  filters: RankingFilters;
  canSubmit: boolean;
  loading: boolean;
  exporting: boolean;
  onChange: (changes: Partial<RankingFilters>) => void;
  onApply: () => void;
  onExport: () => void;
}

const BUTTON_SX = { textTransform: "none", height: 40 };

const RankingFiltersCard = ({
  filters,
  canSubmit,
  loading,
  exporting,
  onChange,
  onApply,
  onExport,
}: RankingFiltersCardProps) => (
  <Card sx={{ borderRadius: 3, mb: 3 }}>
    <CardContent>
      <Grid container spacing={2} alignItems="end">
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Data inicial"
            value={filters.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Data final"
            value={filters.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) =>
              onChange({ status: e.target.value as RankingStatusFilter })
            }
          >
            {RANKING_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Itens"
            value={String(filters.pageSize)}
            onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
          >
            {RANKING_PAGE_SIZE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onApply}
            disabled={loading || !canSubmit}
            sx={BUTTON_SX}
          >
            Atualizar ranking
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onExport}
            disabled={exporting || loading || !canSubmit}
            sx={BUTTON_SX}
          >
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default RankingFiltersCard;
