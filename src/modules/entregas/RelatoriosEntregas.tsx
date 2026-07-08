import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../services/api";

interface RankingItem {
  deliverymanId: number;
  deliverymanName: string;
  totalDeliveries: number;
}

interface RankingResponse {
  items: RankingItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  totalDeliveries: number;
}

type StatusFilter = "all" | "delivered" | "finished";

const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const RelatoriosEntregas: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return toInputDate(date);
  });
  const [endDate, setEndDate] = useState<string>(() => toInputDate(new Date()));
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [csvLoading, setCsvLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = async (targetPage?: number) => {
    const requestPage = targetPage ?? page;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<RankingResponse>(
        "/orderDelivery/ranking/deliveryman",
        {
          params: {
            startDate,
            endDate,
            status,
            page: requestPage,
            pageSize,
          },
        }
      );

      const data = response.data;
      setRanking(Array.isArray(data?.items) ? data.items : []);
      setPage(Number(data?.page ?? requestPage));
      setTotalPages(Number(data?.totalPages ?? 1));
      setTotalItems(Number(data?.totalItems ?? 0));
      setTotalDeliveries(Number(data?.totalDeliveries ?? 0));
    } catch {
      setError("Erro ao carregar ranking de entregadores.");
      setRanking([]);
      setTotalPages(1);
      setTotalItems(0);
      setTotalDeliveries(0);
    } finally {
      setLoading(false);
    }
  };

  const escapeCsv = (value: string | number): string => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportCsv = async () => {
    setCsvLoading(true);
    setError(null);

    try {
      const allItems: RankingItem[] = [];
      let exportPage = 1;
      let exportTotalPages = 1;

      while (exportPage <= exportTotalPages) {
        const response = await api.get<RankingResponse>(
          "/orderDelivery/ranking/deliveryman",
          {
            params: {
              startDate,
              endDate,
              status,
              page: exportPage,
              pageSize: 100,
            },
          }
        );

        const data = response.data;
        const pageItems = Array.isArray(data?.items) ? data.items : [];
        allItems.push(...pageItems);
        exportTotalPages = Number(data?.totalPages ?? 1);
        exportPage += 1;
      }

      const lines = ["posicao,entregador,total_entregas"];
      allItems.forEach((item, index) => {
        lines.push(
          [
            escapeCsv(index + 1),
            escapeCsv(item.deliverymanName),
            escapeCsv(item.totalDeliveries),
          ].join(",")
        );
      });

      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ranking-entregadores-${startDate}-${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Erro ao exportar CSV do ranking.");
    } finally {
      setCsvLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Relatório de ranking de entregadores
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Entregadores com mais entregas finalizadas por período.
      </Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="end">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Data inicial"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Data final"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                <option value="all">Todos</option>
                <option value="delivered">Entregues</option>
                <option value="finished">Finalizadas</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Itens"
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => loadRanking(1)}
                disabled={loading || !startDate || !endDate}
                sx={{ textTransform: "none", height: 40 }}
              >
                Atualizar ranking
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={exportCsv}
                disabled={csvLoading || loading || !startDate || !endDate}
                sx={{ textTransform: "none", height: 40 }}
              >
                {csvLoading ? "Exportando..." : "Exportar CSV"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

      {!loading && !error && ranking.length === 0 && (
        <Alert severity="info">Nenhuma entrega encontrada no período.</Alert>
      )}

      {!loading && !error && ranking.length > 0 && (
        <Stack spacing={1.5}>
          <Alert severity="success" sx={{ mb: 1 }}>
            Total de entregas no período: <strong>{totalDeliveries}</strong> | 
            Entregadores no filtro: <strong>{totalItems}</strong>
          </Alert>

          {ranking.map((item, index) => (
            <Card key={item.deliverymanId} sx={{ borderRadius: 2 }}>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    #{index + 1}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {item.deliverymanName}
                  </Typography>
                </Box>

                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {item.totalDeliveries}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {!loading && !error && ranking.length > 0 && (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Página {page} de {totalPages}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              disabled={loading || page <= 1}
              onClick={() => loadRanking(page - 1)}
              sx={{ textTransform: "none" }}
            >
              Anterior
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={loading || page >= totalPages}
              onClick={() => loadRanking(page + 1)}
              sx={{ textTransform: "none" }}
            >
              Próxima
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default RelatoriosEntregas;
