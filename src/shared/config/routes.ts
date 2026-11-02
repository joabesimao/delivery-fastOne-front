export const ROUTES = {
  root: "/",
  login: "/login",

  dashboard: "/dashboard",
  dashboardReports: "/dashboard/relatorios",
  clients: "/dashboard/clientes",
  products: "/dashboard/produtos",
  users: "/dashboard/usuarios",

  newDelivery: "/realizar-entrega",
  finishDelivery: "/finalizar-entrega",
  deliveryReports: "/relatorios-entregas",
  deliverymanReports: "/relatorios-entregas/entregadores",
  deliveries: "/listagem-entregas",
  deliverymen: "/listagem-entregadores",

  registerClient: "/cadastros/cliente",
  registerProduct: "/cadastros/produto",
  registerDeliveryman: "/cadastros/entregador",
  registerNeighborhoods: "/cadastros/bairros",
  registerCities: "/cadastros/cidades",
  registerVehicle: "/cadastros/veiculo",
  registerOilChange: "/cadastros/troca-oleo",
  registerFuelRefill: "/cadastros/abastecimento",
  oilChanges: "/listagem-trocas-oleo",
  fuelRefills: "/listagem-abastecimentos",

  visualSettings: "/configuracoes/visuais",
  fleetSettings: "/configuracoes/frota",

  chat: "/chat",
  branches: "/filiais",
} as const;

export const HOME_ROUTE = ROUTES.dashboard;
