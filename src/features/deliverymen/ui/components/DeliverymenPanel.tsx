import { Typography } from "@mui/material";
import { cpfMask, phoneMask } from "@/shared/lib/masks";
import {
  useSurfaceColors,
  useSurfaceInputSx,
} from "@/shared/theme/useSurfaceColors";
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
  deliverymanFullName,
  type Deliveryman,
  type DeliverymanFilters,
} from "../../domain/deliveryman";

import { COLORS } from "@/shared/theme/colors";
interface DeliverymenPanelProps {
  deliverymen: Deliveryman[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: DeliverymanFilters;
  busyId: number | null;
  paginationProps: PaginationProps;
  onFiltersChange: (changes: Partial<DeliverymanFilters>) => void;
  onView: (deliveryman: Deliveryman) => void;
  onEdit: (deliveryman: Deliveryman) => void;
  onDelete: (deliveryman: Deliveryman) => void;
}

const DeliverymenPanel = ({
  deliverymen,
  total,
  loading,
  error,
  filters,
  busyId,
  paginationProps,
  onFiltersChange,
  onView,
  onEdit,
  onDelete,
}: DeliverymenPanelProps) => {
  const colors = useSurfaceColors();
  const inputSx = useSurfaceInputSx();
  const bodySx = { color: colors.textBody };

  const columns: DataTableColumn<Deliveryman>[] = [
    {
      key: "name",
      header: "Nome do entregador",
      render: (d) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: 13, color: colors.textPrimary }}
        >
          {deliverymanFullName(d)}
        </Typography>
      ),
    },
    {
      key: "id",
      header: "ID",
      render: (d) => d.id,
      cellSx: { color: colors.textSecondary },
    },
    {
      key: "phone",
      header: "Telefone",
      render: (d) => phoneMask(d.phone),
      cellSx: bodySx,
    },
    {
      key: "cpf",
      header: "CPF",
      render: (d) => (d.cpf ? cpfMask(d.cpf) : "—"),
      cellSx: bodySx,
    },
    {
      key: "qualification",
      header: "Habilitação",
      render: (d) => d.numberQualification,
      cellSx: bodySx,
    },
    {
      key: "actions",
      header: "Ações",
      render: (d) => (
        <RowActions
          disabled={busyId === d.id}
          onView={() => onView(d)}
          onEdit={() => onEdit(d)}
          onDelete={() => onDelete(d)}
        />
      ),
    },
  ];

  const hasFilters = Boolean(filters.name || filters.phone);

  return (
    <SurfacePanel
      title="Listagem de entregadores"
      loading={loading}
      error={error}
      loaderColor={COLORS.info}
      filters={
        <>
          <SurfaceFilter label="Buscar entregador" minWidth={200}>
            <SearchField
              placeholder="Digite o nome do entregador"
              value={filters.name}
              onChange={(name) => onFiltersChange({ name })}
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
        </>
      }
    >
      <SurfaceTable
        columns={columns}
        rows={deliverymen}
        getRowId={(d) => d.id}
        emptyMessage={
          hasFilters
            ? "Nenhum entregador encontrado para os filtros aplicados."
            : "Nenhum entregador cadastrado."
        }
      />
      <SurfacePaginationFooter
        total={total}
        paginationProps={paginationProps}
      />
    </SurfacePanel>
  );
};

export default DeliverymenPanel;
