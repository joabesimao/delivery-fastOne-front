import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useClientPagination } from "@/shared/lib/hooks/useClientPagination";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebouncedValue";
import ConfirmDialog from "@/shared/ui/dialogs/ConfirmDialog";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import SearchField from "@/shared/ui/form/SearchField";
import {
  ROLE_FILTER_OPTIONS,
  toUserListParams,
  type User,
  type UserRoleFilter,
} from "../../domain/user";
import {
  useDeleteUser,
  useSetUserActive,
  useUsers,
} from "../../application/userQueries";
import UserFormDialog from "../components/UserFormDialog";
import UsersTable from "../components/UsersTable";

const DEBOUNCE_MS = 400;

type FormState = { open: false } | { open: true; user: User | null };

const UsersPage = () => {
  const runWithFeedback = useActionFeedback();

  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState<UserRoleFilter>("all");
  const [form, setForm] = useState<FormState>({ open: false });
  const [deleting, setDeleting] = useState<User | null>(null);

  const search = useDebouncedValue(searchInput.trim(), DEBOUNCE_MS);
  const params = useMemo(
    () => toUserListParams({ search, role }),
    [search, role],
  );

  const usersQuery = useUsers(params);
  const setUserActive = useSetUserActive();
  const deleteUser = useDeleteUser();

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const { pageItems, paginationProps } = useClientPagination(users, {
    initialRowsPerPage: 10,
    resetKey: JSON.stringify(params),
  });

  const loading = usersQuery.isPending;
  const hasActiveFilters = Boolean(searchInput || role !== "all");
  const busyId =
    (setUserActive.isPending && setUserActive.variables?.id) ||
    (deleteUser.isPending && deleteUser.variables) ||
    null;

  const handleToggleActive = (user: User) =>
    void runWithFeedback(
      () => setUserActive.mutateAsync({ id: user.id, active: !user.active }),
      {
        success: user.active
          ? "Usuário desativado com sucesso."
          : "Usuário ativado com sucesso.",
        error: "Não foi possível alterar o status do usuário.",
      },
    );

  const handleDelete = async () => {
    if (!deleting) return;
    const succeeded = await runWithFeedback(
      () => deleteUser.mutateAsync(deleting.id),
      {
        success: "Usuário excluído com sucesso.",
        error: "Erro ao excluir usuário. Tente novamente.",
      },
    );
    if (succeeded) setDeleting(null);
  };

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os usuários do sistema, seus papéis e permissões de acesso.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setForm({ open: true, user: null })}
          sx={{ borderRadius: 999, whiteSpace: "nowrap" }}
        >
          Novo usuário
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <SearchField
              placeholder="Buscar por nome ou e-mail..."
              value={searchInput}
              onChange={setSearchInput}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Papel"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRoleFilter)
              }
              sx={{ minWidth: 200 }}
            >
              {ROLE_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={() => {
                  setSearchInput("");
                  setRole("all");
                }}
                sx={{ alignSelf: "center", fontWeight: 700 }}
              >
                Limpar filtros
              </Button>
            )}
          </Stack>

          {usersQuery.isError && (
            <Alert severity="error">
              Erro ao carregar a lista de usuários.
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : pageItems.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              {hasActiveFilters
                ? "Nenhum usuário encontrado para os filtros aplicados."
                : "Nenhum usuário cadastrado."}
            </Typography>
          ) : (
            <UsersTable
              users={pageItems}
              busyId={busyId}
              onEdit={(user) => setForm({ open: true, user })}
              onToggleActive={handleToggleActive}
              onDelete={setDeleting}
            />
          )}

          {!loading && pageItems.length > 0 && (
            <TablePagination
              component="div"
              {...paginationProps}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                `Mostrando ${from} a ${to} de ${count} usuários`
              }
            />
          )}
        </Stack>
      </Card>

      <UserFormDialog
        open={form.open}
        user={form.open ? form.user : null}
        onClose={() => setForm({ open: false })}
        onSaved={() => setForm({ open: false })}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir usuário"
        message={
          <>
            Tem certeza que deseja excluir o usuário{" "}
            <strong>{deleting?.name}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={Boolean(deleting && busyId === deleting.id)}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </Stack>
  );
};

export default UsersPage;
