import type { ReactNode } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import type {
  SearchClientResult,
  SearchDeliverymanResult,
  SearchOrderResult,
  SearchResults,
} from "../domain/searchResults";

export interface SearchSelectHandlers {
  onSelectOrder: (order: SearchOrderResult) => void;
  onSelectClient: (client: SearchClientResult) => void;
  onSelectDeliveryman: (deliveryman: SearchDeliverymanResult) => void;
}

interface ResultGroupProps<T> {
  title: string;
  items: T[];
  icon: ReactNode;
  keyOf: (item: T) => string;
  primary: (item: T) => string;
  secondary: (item: T) => string;
  onSelect: (item: T) => void;
}

const ResultGroup = <T,>({
  title,
  items,
  icon,
  keyOf,
  primary,
  secondary,
  onSelect,
}: ResultGroupProps<T>) =>
  items.length > 0 ? (
    <>
      <Typography
        variant="caption"
        sx={{
          px: 2,
          pt: 1.5,
          display: "block",
          fontWeight: 700,
          color: "text.secondary",
        }}
      >
        {title}
      </Typography>
      {items.map((item) => (
        <ListItemButton key={keyOf(item)} onClick={() => onSelect(item)}>
          <ListItemIcon sx={{ minWidth: 34 }}>{icon}</ListItemIcon>
          <ListItemText primary={primary(item)} secondary={secondary(item)} />
        </ListItemButton>
      ))}
    </>
  ) : null;

const SearchResultsList = ({
  results,
  onSelectOrder,
  onSelectClient,
  onSelectDeliveryman,
}: SearchSelectHandlers & { results: SearchResults }) => (
  <List disablePadding dense>
    <ResultGroup
      title="Pedidos"
      items={results.orders}
      icon={<ListAltOutlinedIcon fontSize="small" />}
      keyOf={(order) => `order-${order.id}`}
      primary={(order) => `Pedido #${order.id} — ${order.clientName}`}
      secondary={(order) => order.deliverymanName ?? "Sem entregador"}
      onSelect={onSelectOrder}
    />
    <ResultGroup
      title="Clientes"
      items={results.clients}
      icon={<GroupOutlinedIcon fontSize="small" />}
      keyOf={(client) => `client-${client.id}`}
      primary={(client) => client.name}
      secondary={(client) => client.phone}
      onSelect={onSelectClient}
    />
    <ResultGroup
      title="Entregadores"
      items={results.deliverymen}
      icon={<TwoWheelerOutlinedIcon fontSize="small" />}
      keyOf={(deliveryman) => `deliveryman-${deliveryman.id}`}
      primary={(deliveryman) => `${deliveryman.name} ${deliveryman.lastName}`}
      secondary={(deliveryman) => deliveryman.phone}
      onSelect={onSelectDeliveryman}
    />
  </List>
);

export default SearchResultsList;
