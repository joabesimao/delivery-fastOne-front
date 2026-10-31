import {
  Chip,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import type { User, UserRole } from "../../domain/user";

const ROLE_META: Record<
  UserRole,
  { label: string; color: "error" | "warning" | "info" | "default" }
> = {
  admin: { label: "Administrador", color: "error" },
  gerente_estoque: { label: "Gerente de Estoque", color: "warning" },
  entregador: { label: "Entregador", color: "info" },
  user: { label: "Usuário", color: "default" },
};

const COLUMNS = ["Nome", "E-mail", "Papel", "Status"];

interface UsersTableProps {
  users: User[];
  busyId: number | null;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (user: User) => void;
}

const UsersTable = ({
  users,
  busyId,
  onEdit,
  onToggleActive,
  onDelete,
}: UsersTableProps) => (
  <TableContainer sx={{ overflowX: "auto" }}>
    <Table size="small" sx={{ minWidth: 720 }}>
      <TableHead>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableCell key={column} sx={{ fontWeight: 800 }}>
              {column}
            </TableCell>
          ))}
          <TableCell sx={{ fontWeight: 800 }} align="right">
            Ações
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => {
          const busy = busyId === user.id;
          const roleMeta = ROLE_META[user.role] ?? ROLE_META.user;
          return (
            <TableRow key={user.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                  {user.name}
                </Typography>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={roleMeta.label}
                  size="small"
                  color={roleMeta.color}
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.active ? "Ativo" : "Inativo"}
                  size="small"
                  color={user.active ? "success" : "default"}
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(user)}
                    disabled={busy}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={user.active ? "Desativar" : "Ativar"}>
                  <IconButton
                    size="small"
                    onClick={() => onToggleActive(user)}
                    disabled={busy}
                  >
                    {busy ? (
                      <CircularProgress size={16} />
                    ) : (
                      <PowerSettingsNewRoundedIcon
                        fontSize="small"
                        color={user.active ? "success" : "disabled"}
                      />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(user)}
                    disabled={busy}
                  >
                    <DeleteRoundedIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

export default UsersTable;
