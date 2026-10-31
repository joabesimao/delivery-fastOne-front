import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { cpfMask } from "@/shared/lib/masks";
import {
  useSurfaceColors,
  useSurfaceInputSx,
} from "@/shared/theme/useSurfaceColors";
import ActionIconButton from "@/shared/ui/data-table/ActionIconButton";
import type { DataTableColumn } from "@/shared/ui/data-table/DataTable";
import RowActions from "@/shared/ui/data-table/RowActions";
import SurfaceFilter from "@/shared/ui/data-table/SurfaceFilter";
import SurfacePaginationFooter, {
  type PaginationProps,
} from "@/shared/ui/data-table/SurfacePaginationFooter";
import SurfacePanel from "@/shared/ui/data-table/SurfacePanel";
import SurfaceTable from "@/shared/ui/data-table/SurfaceTable";
import SearchField from "@/shared/ui/form/SearchField";
import {
  ALL_CLIENTS,
  hasClientFilters,
  type Client,
  type ClientFilters,
  type ClientStatusFilter,
} from "../../domain/client";
import ClientStatusChip from "./ClientStatusChip";

import { COLORS } from "@/shared/theme/colors";
interface ClientsPanelProps {
  clients: Client[];
  total: number;
  cities: string[];
  loading: boolean;
  error: string | null;
  filters: ClientFilters;
  busyId: number | null;
  paginationProps: PaginationProps;
  onFiltersChange: (changes: Partial<ClientFilters>) => void;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onToggleActive: (client: Client) => void;
}

const ClientsPanel = ({
  clients,
  total,
  cities,
  loading,
  error,
  filters,
  busyId,
  paginationProps,
  onFiltersChange,
  onView,
  onEdit,
  onToggleActive,
}: ClientsPanelProps) => {
  const colors = useSurfaceColors();
  const inputSx = useSurfaceInputSx();
  const selectSx = { borderRadius: 2, bgcolor: colors.inputBg, fontSize: 13 };
  const bodySx = { color: colors.textBody };

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Nome do cliente",
      render: (c) => (
        <Box>
          <Typography
            sx={{ fontWeight: 600, fontSize: 13, color: colors.textPrimary }}
          >
            {c.name}
          </Typography>
          {c.address?.street && (
            <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>
              {c.address.street}
              {c.address.numberHouse ? `, ${c.address.numberHouse}` : ""}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "id",
      header: "ID",
      render: (c) => c.id,
      cellSx: { color: colors.textSecondary },
    },
    {
      key: "cpf",
      header: "CPF",
      render: (c) => (c.cpf ? cpfMask(c.cpf) : "—"),
      cellSx: bodySx,
    },
    {
      key: "phone",
      header: "Telefone do cliente",
      render: (c) => c.phone,
      cellSx: bodySx,
    },
    {
      key: "neighborhood",
      header: "Bairro",
      render: (c) => c.address?.neighborhood ?? "—",
      cellSx: bodySx,
    },
    {
      key: "city",
      header: "Cidade",
      render: (c) => c.address?.city ?? "—",
      cellSx: bodySx,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <ClientStatusChip active={c.active} />,
    },
    {
      key: "actions",
      header: "Ações",
      render: (c) => {
        const busy = busyId === c.id;
        return (
          <RowActions
            disabled={busy}
            onView={() => onView(c)}
            onEdit={() => onEdit(c)}
          >
            <ActionIconButton
              title={c.active ? "Inativar" : "Ativar"}
              disabled={busy}
              loading={busy}
              onClick={() => onToggleActive(c)}
              color={c.active ? COLORS.danger : "#22c55e"}
              hoverColor={c.active ? COLORS.dangerHover : "#16a34a"}
              icon={
                <PowerSettingsNewIcon
                  sx={{ fontSize: 16, color: COLORS.white }}
                />
              }
            />
          </RowActions>
        );
      },
    },
  ];

  return (
    <SurfacePanel
      title="Listagem de clientes"
      loading={loading}
      error={error}
      loaderColor={COLORS.info}
      filters={
        <>
          <SurfaceFilter label="Buscar cliente" minWidth={200}>
            <SearchField
              placeholder="Digite o nome do cliente"
              value={filters.search}
              onChange={(search) => onFiltersChange({ search })}
              clearable
              sx={inputSx}
            />
          </SurfaceFilter>
          <SurfaceFilter label="Buscar por telefone" minWidth={180}>
            <SearchField
              placeholder="Digite o telefone"
              value={filters.phone}
              onChange={(phone) => onFiltersChange({ phone })}
              clearable
              sx={inputSx}
            />
          </SurfaceFilter>
          <SurfaceFilter label="Cidades" minWidth={160}>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.city}
                onChange={(e) => onFiltersChange({ city: e.target.value })}
                displayEmpty
                sx={selectSx}
              >
                <MenuItem value={ALL_CLIENTS}>Filtrar por cidade</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SurfaceFilter>
          <SurfaceFilter label="Status do Cliente" minWidth={160}>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.status}
                onChange={(e) =>
                  onFiltersChange({
                    status: e.target.value as ClientStatusFilter,
                  })
                }
                displayEmpty
                sx={selectSx}
              >
                <MenuItem value={ALL_CLIENTS}>Filtrar por status...</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </SurfaceFilter>
        </>
      }
    >
      <SurfaceTable
        columns={columns}
        rows={clients}
        getRowId={(c) => c.id}
        emptyMessage={
          hasClientFilters(filters)
            ? "Nenhum cliente encontrado para os filtros aplicados."
            : "Nenhum cliente cadastrado."
        }
      />
      <SurfacePaginationFooter
        total={total}
        paginationProps={paginationProps}
      />
    </SurfacePanel>
  );
};

export default ClientsPanel;
