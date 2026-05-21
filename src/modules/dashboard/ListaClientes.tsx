import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Chip,
  useTheme,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import api from "../../services/api";

interface Address {
  street: string;
  neighborhood: string;
  numberHouse: number;
  reference: string;
  city: string;
}

interface ClientItem {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  Register?: {
    address: Address;
  };
}

const ListaClientes: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [clientes, setClientes] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ClientItem[]>("/client")
      .then((res) => setClientes(res.data))
      .catch(() => setError("Erro ao carregar a lista de clientes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <PeopleAltIcon
          sx={{ color: isDark ? "#7C9CBF" : "#003459", fontSize: 28 }}
        />
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: isDark ? "#E2E4EC" : "#003459" }}
        >
          Lista de Clientes
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress sx={{ color: isDark ? "#7C9CBF" : "#003459" }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: isDark
              ? "0 2px 12px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,52,89,0.10)",
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
                {[
                  "#",
                  "Nome",
                  "Telefone",
                  "Rua",
                  "Bairro",
                  "Nº",
                  "Referência",
                  "Cidade",
                ].map((col) => (
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
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 5,
                      color: isDark ? "#7C7F8E" : "#94a3b8",
                      fontSize: 14,
                    }}
                  >
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((c, idx) => {
                  const addr = c.Register?.address;
                  return (
                    <TableRow
                      key={c.id}
                      hover
                      sx={{
                        backgroundColor: isDark
                          ? idx % 2 === 0
                            ? "#0e0f0f"
                            : "#0f0e0e"
                          : idx % 2 === 0
                          ? "#ffffff"
                          : "#f8fafd",
                        transition: "background-color 0.15s",
                        "&:hover": {
                          backgroundColor: isDark ? "#1a2535" : "#eef4fb",
                        },
                        "& td": {
                          borderColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "#e2e8f0",
                          color: isDark ? "#C8CAD4" : "#374151",
                          fontSize: 13,
                          py: 1.2,
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={c.id}
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
                        {c.name} {c.lastName}
                      </TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{addr?.street ?? "—"}</TableCell>
                      <TableCell>{addr?.neighborhood ?? "—"}</TableCell>
                      <TableCell align="center">{addr?.numberHouse ?? "—"}</TableCell>
                      <TableCell sx={{ color: isDark ? "#7C9CBF !important" : "#6b7280 !important", fontStyle: "italic" }}>
                        {addr?.reference ?? "—"}
                      </TableCell>
                      <TableCell>{addr?.city ?? "—"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListaClientes;
