import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import api from "../../../services/api";

interface VehicleOption {
  id: number;
  plate: string;
  model: string;
}

interface DeliverymanOption {
  id: number;
  name: string;
  lastName: string;
}

interface OilChangeLogItem {
  id: number;
  vehicleId: number;
  deliverymanId: number;
  km: number;
  nextChangeKm: number;
  changeDate: string;
  vehicle?: { plate: string; model: string } | null;
  deliveryman?: { name: string; lastName: string } | null;
}

interface ListaTrocaOleoProps {
  refreshKey?: number;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
};

const ListaTrocaOleo: React.FC<ListaTrocaOleoProps> = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [logs, setLogs] = useState<OilChangeLogItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [deliverymen, setDeliverymen] = useState<DeliverymanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicleLabel = (item: OilChangeLogItem) => {
    if (item.vehicle) return `${item.vehicle.plate} — ${item.vehicle.model}`;
    const v = vehicles.find((veh) => veh.id === item.vehicleId);
    return v ? `${v.plate} — ${v.model}` : "—";
  };

  const deliverymanLabel = (item: OilChangeLogItem) => {
    if (item.deliveryman) return `${item.deliveryman.name} ${item.deliveryman.lastName}`;
    const d = deliverymen.find((dm) => dm.id === item.deliverymanId);
    return d ? `${d.name} ${d.lastName}` : "—";
  };

  useEffect(() => {
    api
      .get<VehicleOption[]>("/vehicle")
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicles([]));
    api
      .get<DeliverymanOption[]>("/deliveryman")
      .then((res) => setDeliverymen(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDeliverymen([]));
  }, []);

  const loadLogs = () => {
    setLoading(true);
    api
      .get<OilChangeLogItem[]>("/oil-change-log")
      .then((res) => setLogs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Erro ao carregar o histórico de trocas de óleo."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [refreshKey]);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <BuildIcon sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: isDark ? "#E2E4EC" : "#003459" }}>
          Histórico de trocas de óleo
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress sx={{ color: isDark ? "#7C9CBF" : "#003459" }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,52,89,0.10)",
            border: isDark ? "none" : "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: isDark
                    ? "#003459"
                    : "linear-gradient(90deg, #003459 0%, #005588 100%)",
                }}
              >
                {["#", "Veículo", "Entregador", "Km lançado", "Km próxima troca", "Data"].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      color: "#e7dbdb",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      letterSpacing: 0.4,
                      borderBottom: "none",
                      py: 1.5,
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 5, color: isDark ? "#7C7F8E" : "#94a3b8", fontSize: 14 }}
                  >
                    Nenhuma troca de óleo lançada.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, idx) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      backgroundColor: isDark
                        ? idx % 2 === 0 ? "#0e0f0f" : "#0f0e0e"
                        : idx % 2 === 0 ? "#ffffff" : "#f8fafd",
                      transition: "background-color 0.15s",
                      "&:hover": { backgroundColor: isDark ? "#1a2535" : "#eef4fb" },
                      "& td": {
                        borderColor: isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0",
                        color: isDark ? "#C8CAD4" : "#374151",
                        fontSize: 13,
                        py: 1.2,
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={log.id}
                        size="small"
                        sx={{
                          backgroundColor: isDark ? "#003459" : "#dbeafe",
                          color: isDark ? "#fff" : "#1e40af",
                          fontWeight: 700,
                          fontSize: 11,
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: isDark ? "#E2E4EC !important" : "#111827 !important" }}>
                      {vehicleLabel(log)}
                    </TableCell>
                    <TableCell>{deliverymanLabel(log)}</TableCell>
                    <TableCell>{log.km.toLocaleString("pt-BR")} km</TableCell>
                    <TableCell>{log.nextChangeKm.toLocaleString("pt-BR")} km</TableCell>
                    <TableCell>{formatDate(log.changeDate)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListaTrocaOleo;
