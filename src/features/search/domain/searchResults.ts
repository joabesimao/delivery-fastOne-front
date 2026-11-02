export interface SearchOrderResult {
  id: number;
  status: string;
  amount: number;
  clientName: string;
  deliverymanName: string | null;
}

export interface SearchClientResult {
  id: number;
  name: string;
  cpf: string;
  phone: string;
}

export interface SearchDeliverymanResult {
  id: number;
  name: string;
  lastName: string;
  phone: string;
}

export interface SearchResults {
  orders: SearchOrderResult[];
  clients: SearchClientResult[];
  deliverymen: SearchDeliverymanResult[];
}

export const MIN_SEARCH_LENGTH = 2;

export const isSearchable = (term: string): boolean =>
  term.trim().length >= MIN_SEARCH_LENGTH;

export const hasAnyResult = (
  results: SearchResults | null | undefined,
): results is SearchResults =>
  Boolean(
    results &&
    (results.orders.length ||
      results.clients.length ||
      results.deliverymen.length),
  );
