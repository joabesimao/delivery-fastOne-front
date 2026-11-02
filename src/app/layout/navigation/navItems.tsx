import type { ReactNode } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import LocalGasStationOutlinedIcon from "@mui/icons-material/LocalGasStationOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import { ROUTES } from "@/shared/config/routes";

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number;
  activePaths?: string[];
}

const FLEET_SETTINGS_ROLES = ["admin", "gerente_estoque"];

export const buildNavItems = (
  role: string | null,
  chatUnreadCount: number,
): NavItem[] => [
  {
    label: "Dashboard",
    path: ROUTES.dashboard,
    icon: <DashboardOutlinedIcon fontSize="small" />,
    activePaths: [ROUTES.dashboardReports],
  },
  {
    label: "Pedidos de Entrega",
    path: ROUTES.deliveries,
    icon: <ListAltOutlinedIcon fontSize="small" />,
  },
  {
    label: "Finalizar Entregas",
    path: ROUTES.finishDelivery,
    icon: <CheckCircleOutlineIcon fontSize="small" />,
  },
  {
    label: "Clientes",
    path: ROUTES.clients,
    icon: <GroupOutlinedIcon fontSize="small" />,
  },
  {
    label: "Entregadores",
    path: ROUTES.deliverymen,
    icon: <TwoWheelerOutlinedIcon fontSize="small" />,
  },
  {
    label: "Veículos",
    path: ROUTES.registerVehicle,
    icon: <DirectionsCarOutlinedIcon fontSize="small" />,
  },
  {
    label: "Troca de Óleo",
    path: ROUTES.oilChanges,
    icon: <BuildOutlinedIcon fontSize="small" />,
    activePaths: [ROUTES.registerOilChange],
  },
  {
    label: "Abastecimento",
    path: ROUTES.fuelRefills,
    icon: <LocalGasStationOutlinedIcon fontSize="small" />,
    activePaths: [ROUTES.registerFuelRefill],
  },
  {
    label: "Produtos",
    path: ROUTES.products,
    icon: <Inventory2OutlinedIcon fontSize="small" />,
  },
  {
    label: "Localidades",
    path: ROUTES.registerCities,
    icon: <PlaceOutlinedIcon fontSize="small" />,
  },
  {
    label: "Chat",
    path: ROUTES.chat,
    icon: <ChatOutlinedIcon fontSize="small" />,
    badge: chatUnreadCount,
  },
  {
    label: "Filiais",
    path: ROUTES.branches,
    icon: <StoreOutlinedIcon fontSize="small" />,
  },
  {
    label: "Configurações",
    path: ROUTES.visualSettings,
    icon: <SettingsOutlinedIcon fontSize="small" />,
  },
  ...(role && FLEET_SETTINGS_ROLES.includes(role)
    ? [
        {
          label: "Configurações de Frota",
          path: ROUTES.fleetSettings,
          icon: <SpeedOutlinedIcon fontSize="small" />,
        },
      ]
    : []),
  ...(role === "admin"
    ? [
        {
          label: "Usuários",
          path: ROUTES.users,
          icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
        },
      ]
    : []),
];

export const isNavItemActive = (item: NavItem, pathname: string): boolean =>
  pathname === item.path || Boolean(item.activePaths?.includes(pathname));

export const formatNavBadge = (count: number): string =>
  count > 99 ? "99+" : String(count);
