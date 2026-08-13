import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Typography,
  Tooltip,
  Collapse,
  Alert,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import GroupsIcon from "@mui/icons-material/Groups";
import MessageIcon from "@mui/icons-material/Message";

import PersonIcon from "@mui/icons-material/Person";
import { useState } from "react";
import type { RealtimeSessionReady } from "../../../services/realtime";

interface ChatHeaderProps {
  session: RealtimeSessionReady | null;
  selectedUnitId: string;
  onUnitChange: (unitId: string) => void;
  isConnected: boolean;
  unitsCount: number;
  messagesCount: number;
  onRefresh?: () => void;
}

export const ChatHeader = ({
  session,
  selectedUnitId,
  onUnitChange,
  isConnected,
  unitsCount,
  messagesCount,
  onRefresh,
}: ChatHeaderProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 3,
        mb: 3,
        background: "linear-gradient(135deg, rgba(33,150,243,0.05) 0%, rgba(63,81,181,0.05) 100%)",
        border: "1px solid",
        borderColor: "primary.lighter",
      }}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        {/* Header Title */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: expanded ? 2 : 0 }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
              }}
            >
              💬 Chat entre Unidades
              {isConnected && (
                <Tooltip title="Conectado">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      display: "inline-block",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": {
                          opacity: 1,
                        },
                        "50%": {
                          opacity: 0.5,
                        },
                        "100%": {
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Tooltip>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comunicação em tempo real entre matriz e filiais
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <IconButton
                onClick={onRefresh}
                size="small"
                title="Atualizar"
              >
                <RefreshIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              <ExpandMoreIcon
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            </IconButton>
          </Stack>
        </Stack>

        {/* Expandable Content */}
        <Collapse in={expanded}>
          <Stack spacing={2}>
            {/* Selectors Row */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              {/* Loja Selector */}
              <TextField
                select
                label="Loja de Envio"
                value={selectedUnitId}
                onChange={(e) => onUnitChange(e.target.value)}
                disabled={!session || session.units.length === 0}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 250 },
                }}
              >
                {session?.units.map((unit) => (
                  <MenuItem key={unit.id} value={String(unit.id)}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                      }}
                    >
                      <Typography variant="body2">{unit.name}</Typography>
                      {unit.isMain && (
                        <Chip
                          label="Matriz"
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ flex: 1 }} />

              {/* Connection Status */}
              {session && (
                <Chip
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: isConnected ? "success.main" : "warning.main",
                        display: "inline-block",
                      }}
                    />
                  }
                  label={`${isConnected ? "Conectado" : "Reconectando"} • ${session.account.role === "principal" ? "Matriz" : "Filial"}`}
                  color={isConnected ? "success" : "warning"}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>

            {/* Stats Row */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                py: 1.5,
                px: 1.5,
                bgcolor: "grey.50",
                borderRadius: 2,
              }}
            >
              <Chip
                icon={<GroupsIcon />}
                label={`${unitsCount} Unidade${unitsCount !== 1 ? "s" : ""}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<MessageIcon />}
                label={`${messagesCount} Mensagem${messagesCount !== 1 ? "s" : ""}`}
                size="small"
                variant="outlined"
              />
              {session && (
                <Chip
                  icon={<PersonIcon />}
                  label={session.account.name}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>

            {/* Info Message */}
            {!session?.units.length && (
              <Alert severity="info">
                Você não tem acesso a nenhuma unidade. Contate o administrador.
              </Alert>
            )}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
};
