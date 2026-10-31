import { useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { downloadTextFile } from "@/shared/lib/downloadFile";
import {
  defaultRankingFilters,
  hasRankingPeriod,
  rankingCsvFileName,
  toRankingCsv,
  type RankingFilters,
  type RankingQuery,
} from "../../domain/deliverymanRanking";
import {
  fetchFullRanking,
  useDeliverymanRanking,
} from "../../application/deliveryQueries";
import { useDeliveryRealtimeSync } from "../../application/useDeliveryRealtimeSync";
import RankingFiltersCard from "../components/RankingFiltersCard";
import RankingList from "../components/RankingList";

const DeliverymanRankingPage = () => {
  const [filters, setFilters] = useState<RankingFilters>(defaultRankingFilters);
  const [query, setQuery] = useState<RankingQuery>(() => ({
    ...filters,
    page: 1,
  }));
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const rankingQuery = useDeliverymanRanking(query);
  const loading = rankingQuery.isFetching;

  const applyFilters = (page = 1) => {
    setExportError(null);
    setQuery({ ...filters, page });
  };

  useDeliveryRealtimeSync(() => applyFilters(1));

  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const items = await fetchFullRanking(filters);
      downloadTextFile(
        toRankingCsv(items),
        rankingCsvFileName(filters),
        "text/csv;charset=utf-8;",
      );
    } catch {
      setExportError("Erro ao exportar CSV do ranking.");
    } finally {
      setExporting(false);
    }
  };

  const error = rankingQuery.isError
    ? "Erro ao carregar ranking de entregadores."
    : exportError;
  const ranking = rankingQuery.data;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Relatório de ranking de entregadores
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Entregadores com mais entregas finalizadas por período.
      </Typography>

      <RankingFiltersCard
        filters={filters}
        canSubmit={hasRankingPeriod(filters)}
        loading={loading}
        exporting={exporting}
        onChange={(changes) =>
          setFilters((current) => ({ ...current, ...changes }))
        }
        onApply={() => applyFilters(1)}
        onExport={() => void exportCsv()}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && ranking && ranking.items.length === 0 && (
        <Alert severity="info">Nenhuma entrega encontrada no período.</Alert>
      )}

      {!loading && !error && ranking && ranking.items.length > 0 && (
        <RankingList
          ranking={ranking}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
        />
      )}
    </Box>
  );
};

export default DeliverymanRankingPage;
