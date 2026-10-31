import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatCurrency } from "@/shared/lib/format/currency";
import { stockInfoOf } from "../../domain/productCatalog";
import type { ProductListViewProps } from "./ProductCardGrid";
import ProductItemActions from "./ProductItemActions";
import { ProductActiveChip, StockChip } from "./ProductStatusChips";

const COLUMNS = ["Produto", "Categoria", "Preço", "Disponibilidade", "Status"];

const ProductTable = ({
  products,
  busyId,
  onEdit,
  onDelete,
}: ProductListViewProps) => (
  <TableContainer sx={{ overflowX: "auto" }}>
    <Table size="small" sx={{ minWidth: 760 }}>
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
        {products.map((product) => (
          <TableRow key={product.id} hover>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                {product.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {product.description}
              </Typography>
            </TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>
              {formatCurrency(product.price)}
            </TableCell>
            <TableCell>
              <StockChip stock={stockInfoOf(product)} />
            </TableCell>
            <TableCell>
              <ProductActiveChip active={product.status} />
            </TableCell>
            <TableCell align="right">
              <ProductItemActions
                busy={busyId === product.id}
                onEdit={() => onEdit(product)}
                onDelete={() => onDelete(product)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ProductTable;
