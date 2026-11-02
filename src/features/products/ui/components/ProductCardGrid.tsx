import {
  Avatar,
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { formatCurrency } from "@/shared/lib/format/currency";
import { toProductImageSrc, type Product } from "../../domain/product";
import { stockInfoOf } from "../../domain/productCatalog";
import { categoryStyleOf } from "./categoryStyle";
import ProductItemActions from "./ProductItemActions";
import { ProductActiveChip, StockChip } from "./ProductStatusChips";

interface ProductListViewProps {
  products: Product[];
  busyId: number | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard = ({
  product,
  busy,
  onEdit,
  onDelete,
}: {
  product: Product;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { color, icon: Icon } = categoryStyleOf(product.category);
  const imageSrc = toProductImageSrc(
    product.imageBase64,
    product.imageMimeType,
  );

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          height: 120,
          position: "relative",
          display: "grid",
          placeItems: "center",
          background: imageSrc
            ? undefined
            : `linear-gradient(135deg, ${alpha(color, 0.22)}, ${alpha(color, 0.06)})`,
        }}
      >
        {imageSrc ? (
          <Box
            component="img"
            src={imageSrc}
            alt={product.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Avatar
            sx={{ width: 44, height: 44, bgcolor: alpha(color, 0.18), color }}
          >
            <Icon />
          </Avatar>
        )}
        <Chip
          icon={<Icon sx={{ fontSize: "14px !important" }} />}
          label={product.category}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            bgcolor: "background.paper",
            fontWeight: 700,
            fontSize: 11,
          }}
        />
        <StockChip
          stock={stockInfoOf(product)}
          opacity={0.16}
          sx={{ position: "absolute", top: 10, right: 10, fontSize: 11 }}
        />
      </Box>

      <Stack spacing={1} sx={{ p: 2 }}>
        <Box sx={{ minHeight: 44 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
            {product.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {formatCurrency(product.price)}
          </Typography>
          <ProductActiveChip active={product.status} sx={{ fontSize: 11 }} />
        </Stack>
        <Stack direction="row" justifyContent="flex-end">
          <Stack direction="row" spacing={0.5}>
            <ProductItemActions
              busy={busy}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

const ProductCardGrid = ({
  products,
  busyId,
  onEdit,
  onDelete,
}: ProductListViewProps) => (
  <Grid container spacing={2}>
    {products.map((product) => (
      <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
        <ProductCard
          product={product}
          busy={busyId === product.id}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product)}
        />
      </Grid>
    ))}
  </Grid>
);

export type { ProductListViewProps };
export default ProductCardGrid;
